'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Mic,
  MicOff,
  Volume2,
  Play,
  Square,
  Settings,
  AlertCircle,
  Loader2
} from 'lucide-react';

// Web Speech API type declarations
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

declare const SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

interface VoiceInputOutputProps {
  className?: string;
  onVoiceQuery?: (query: string) => void;
  onVoiceResponse?: (response: string) => void;
}

interface VoiceSettings {
  voice: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
  volume: number;
  language: string;
}

export function VoiceInputOutput({
  className = '',
  onVoiceQuery,
  onVoiceResponse
}: VoiceInputOutputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<VoiceSettings>({
    voice: null,
    rate: 1,
    pitch: 1,
    volume: 1,
    language: 'en-US'
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Check browser support
  useEffect(() => {
    const speechRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    const speechSynthesisSupported = 'speechSynthesis' in window;

    setIsSupported(speechRecognitionSupported && speechSynthesisSupported);

    if (!speechRecognitionSupported) {
      setError('Speech recognition not supported in this browser');
    } else if (!speechSynthesisSupported) {
      setError('Speech synthesis not supported in this browser');
    }

    // Initialize speech synthesis
    if (speechSynthesisSupported) {
      synthRef.current = window.speechSynthesis;

      // Load voices
      const loadVoices = () => {
        const availableVoices = synthRef.current?.getVoices() || [];
        setVoices(availableVoices);

        // Set default voice
        const defaultVoice = availableVoices.find(voice =>
          voice.lang.startsWith('en') && voice.default
        ) || availableVoices.find(voice => voice.lang.startsWith('en'));

        if (defaultVoice) {
          setSettings(prev => ({ ...prev, voice: defaultVoice }));
        }
      };

      loadVoices();
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Initialize speech recognition
  const initRecognition = () => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = settings.language;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognitionRef.current.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(prev => prev + finalTranscript);
      setInterimTranscript(interimTranscript);
    };

    recognitionRef.current.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };
  };

  // Start listening
  const startListening = () => {
    if (!recognitionRef.current) {
      initRecognition();
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
        setError('Failed to start speech recognition');
      }
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Speak text
  const speakText = (text: string) => {
    if (!synthRef.current || !settings.voice) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = settings.voice;
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      setError('Speech synthesis failed');
    };

    synthRef.current.speak(utterance);
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  // Submit voice query
  const submitVoiceQuery = async () => {
    if (!transcript.trim()) return;

    setIsProcessing(true);
    try {
      // Call the voice query handler
      if (onVoiceQuery) {
        await onVoiceQuery(transcript);
      }

      // Clear transcript after submission
      setTranscript('');
    } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      setError('Failed to process voice query');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle voice response
  useEffect(() => {
    if (onVoiceResponse) {
      // This would be called when AI responds
      // For demo purposes, we'll speak any response
    }
  }, [onVoiceResponse]);

  // Get available languages
  const getAvailableLanguages = () => {
    const languages = new Set<string>();
    voices.forEach(voice => {
      languages.add(voice.lang);
    });
    return Array.from(languages).sort();
  };

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Voice Features Not Supported</h3>
            <p className="text-gray-600">
              Your browser doesn&apos;t support speech recognition or synthesis.
              Try using Chrome, Edge, or Safari for the best experience.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Voice Input & Output</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </motion.div>
      )}

      {/* Voice Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice Input
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={isListening ? stopListening : startListening}
              variant={isListening ? "destructive" : "default"}
              size="lg"
              className="gap-2"
            >
              {isListening ? (
                <>
                  <MicOff className="h-5 w-5" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5" />
                  Start Listening
                </>
              )}
            </Button>

            <div className="flex-1">
              <Textarea
                value={transcript + interimTranscript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Speak or type your question..."
                className="min-h-[100px]"
                disabled={isProcessing}
              />
              {interimTranscript && (
                <div className="text-sm text-gray-500 mt-1 italic">
                  {interimTranscript}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={isListening ? "default" : "secondary"}>
                {isListening ? 'Listening...' : 'Ready'}
              </Badge>
              {transcript && (
                <span className="text-sm text-gray-600">
                  {transcript.length} characters
                </span>
              )}
            </div>

            <Button
              onClick={submitVoiceQuery}
              disabled={!transcript.trim() || isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isProcessing ? 'Processing...' : 'Ask AI'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Voice Output */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Voice Output
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={isSpeaking ? stopSpeaking : () => speakText("Hello! I'm ready to help you with your learning. What would you like to know?")}
              variant={isSpeaking ? "destructive" : "default"}
              size="lg"
              className="gap-2"
            >
              {isSpeaking ? (
                <>
                  <Square className="h-5 w-5" />
                  Stop Speaking
                </>
              ) : (
                <>
                  <Volume2 className="h-5 w-5" />
                  Test Voice
                </>
              )}
            </Button>

            <div className="flex-1">
              <div className="text-sm text-gray-600">
                Click &quot;Test Voice&quot; to hear how the AI will sound when responding to your questions.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={isSpeaking ? "default" : "secondary"}>
              {isSpeaking ? 'Speaking...' : 'Ready'}
            </Badge>
            <span className="text-sm text-gray-600">
              Voice: {settings.voice?.name || 'Default'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card>
              <CardHeader>
                <CardTitle>Voice Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Voice Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Voice</label>
                  <Select
                    value={settings.voice?.name || ''}
                    onValueChange={(voiceName) => {
                      const voice = voices.find(v => v.name === voiceName);
                      if (voice) {
                        setSettings(prev => ({ ...prev, voice }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map((voice) => (
                        <SelectItem key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Language Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Language</label>
                  <Select
                    value={settings.language}
                    onValueChange={(language) => {
                      setSettings(prev => ({ ...prev, language }));
                      if (recognitionRef.current) {
                        recognitionRef.current.lang = language;
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableLanguages().map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Rate */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Speed</label>
                    <span className="text-sm text-gray-600">{settings.rate}x</span>
                  </div>
                  <Slider
                    value={[settings.rate]}
                    onValueChange={([rate]) => setSettings(prev => ({ ...prev, rate }))}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                {/* Pitch */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Pitch</label>
                    <span className="text-sm text-gray-600">{settings.pitch}</span>
                  </div>
                  <Slider
                    value={[settings.pitch]}
                    onValueChange={([pitch]) => setSettings(prev => ({ ...prev, pitch }))}
                    min={0}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                {/* Volume */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Volume</label>
                    <span className="text-sm text-gray-600">{Math.round(settings.volume * 100)}%</span>
                  </div>
                  <Slider
                    value={[settings.volume]}
                    onValueChange={([volume]) => setSettings(prev => ({ ...prev, volume }))}
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                {/* Test Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => speakText("This is a test of the voice settings.")}
                    className="gap-2"
                  >
                    <Volume2 className="h-4 w-4" />
                    Test Voice
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSettings({
                        voice: voices.find(v => v.lang.startsWith('en') && v.default) || voices[0],
                        rate: 1,
                        pitch: 1,
                        volume: 1,
                        language: 'en-US'
                      });
                    }}
                  >
                    Reset to Default
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Usage Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Voice Usage Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">For Best Results:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Speak clearly and at a normal pace</li>
                <li>• Use a quiet environment</li>
                <li>• Hold the microphone close to your mouth</li>
                <li>• Pause briefly between sentences</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Supported Features:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Voice-to-text conversion</li>
                <li>• Text-to-speech responses</li>
                <li>• Multiple voice options</li>
                <li>• Adjustable speech settings</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}