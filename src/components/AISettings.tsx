import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, Save } from 'lucide-react';
import { getCSRFToken } from '@/lib/utils';

interface AISettingsProps {
  userId: string;
  userType: 'teacher' | 'student';
  onSave?: () => void;
}

interface AIModel {
  id: string;
  name: string;
  provider: string;
}

interface AISettingsData {
  provider: string;
  apiKey: string;
  baseUrl: string;
  model: string;
  enableWebTTS: boolean;
  enableWebSTT: boolean;
  ttsProvider: string;
  ttsModel: string;
  sttProvider: string;
  sttModel: string;
  enableInternetSearch: boolean;
  searchProvider: string;
  searchApiKey: string;
  userLanguage: string;
  userCountry: string;
  educationLevel: string;
  mentorPersona: string;
}

export function AISettings({ userId, userType, onSave }: AISettingsProps) {
  const [settings, setSettings] = useState<AISettingsData>({
    provider: 'openai',
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    model: '',
    enableWebTTS: false,
    enableWebSTT: false,
    ttsProvider: 'web',
    ttsModel: '',
    sttProvider: 'web',
    sttModel: '',
    enableInternetSearch: false,
    searchProvider: 'serpapi',
    searchApiKey: '',
    userLanguage: 'sl',
    userCountry: 'SI',
    educationLevel: 'secondary',
    mentorPersona: 'friendly-grandma',
  });

  const [models, setModels] = useState<AIModel[]>([]);
  const [ttsModels, setTtsModels] = useState<AIModel[]>([]);
  const [sttModels, setSttModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadSettings = useCallback(async () => {
    try {
      const response = await fetch(`/api/users/${userId}/ai-settings`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to load AI settings:', err);
    }
  }, [userId]);

  // Load existing settings
  useEffect(() => {
    loadSettings();
  }, [userId, loadSettings]);

  const fetchModels = async () => {
    setLoading(true);
    setError('');

    try {
      const csrfToken = await getCSRFToken();
      const response = await fetch('/api/ai/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({
          provider: settings.provider,
          apiKey: settings.apiKey,
          baseUrl: settings.baseUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }

      const data = await response.json();
      setModels(data.models || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch models');
    } finally {
      setLoading(false);
    }
  };

  const fetchTTSModels = async () => {
    // For now, just set web speech voices
    if ('speechSynthesis' in window) {
      const voices = speechSynthesis.getVoices();
      setTtsModels(voices.map(voice => ({
        id: voice.name,
        name: voice.name,
        provider: 'web',
      })));
    }
  };

  const fetchSTTModels = async () => {
    // Web Speech Recognition doesn't have specific models
    setSttModels([{
      id: 'web-default',
      name: 'Web Speech Recognition',
      provider: 'web',
    }]);
  };

  const saveSettings = async () => {
    setSaving(true);
    setError('');

    try {
      const csrfToken = await getCSRFToken();
      const response = await fetch(`/api/users/${userId}/ai-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      onSave?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const providers = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'grok', label: 'Grok (xAI)' },
    { value: 'ollama', label: 'Ollama (Local)' },
    { value: 'custom', label: 'Custom OpenAI-compatible' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Model Settings</CardTitle>
          <CardDescription>
            Configure your AI provider and model for {userType === 'teacher' ? 'teaching' : 'learning'} assistance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="provider">AI Provider</Label>
              <Select
                value={settings.provider}
                onValueChange={(value) => setSettings(prev => ({ ...prev, provider: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map(provider => (
                    <SelectItem key={provider.value} value={provider.value}>
                      {provider.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="baseUrl">API Base URL</Label>
              <Input
                id="baseUrl"
                value={settings.baseUrl}
                onChange={(e) => setSettings(prev => ({ ...prev, baseUrl: e.target.value }))}
                placeholder="https://api.openai.com/v1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={settings.apiKey}
              onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="Enter your API key"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={fetchModels} disabled={loading || !settings.apiKey}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Refresh Models
            </Button>
          </div>

          {models.length > 0 && (
            <div>
              <Label htmlFor="model">Select Model</Label>
              <Select
                value={settings.model}
                onValueChange={(value) => setSettings(prev => ({ ...prev, model: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name} ({model.provider})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Text-to-Speech (TTS) Settings</CardTitle>
          <CardDescription>Configure voice synthesis for audio output.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="enableWebTTS"
              checked={settings.enableWebTTS}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableWebTTS: checked }))}
            />
            <Label htmlFor="enableWebTTS">Enable Web TTS</Label>
          </div>

          {settings.enableWebTTS && (
            <>
              <div>
                <Label htmlFor="ttsProvider">TTS Provider</Label>
                <Select
                  value={settings.ttsProvider}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, ttsProvider: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">Web Speech API</SelectItem>
                    <SelectItem value="openai">OpenAI TTS</SelectItem>
                    <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={fetchTTSModels} disabled={settings.ttsProvider !== 'web'}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Load Voices
                </Button>
              </div>

              {ttsModels.length > 0 && (
                <div>
                  <Label htmlFor="ttsModel">TTS Voice/Model</Label>
                  <Select
                    value={settings.ttsModel}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, ttsModel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {ttsModels.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Speech-to-Text (STT) Settings</CardTitle>
          <CardDescription>Configure speech recognition for audio input.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="enableWebSTT"
              checked={settings.enableWebSTT}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableWebSTT: checked }))}
            />
            <Label htmlFor="enableWebSTT">Enable Web STT</Label>
          </div>

          {settings.enableWebSTT && (
            <>
              <div>
                <Label htmlFor="sttProvider">STT Provider</Label>
                <Select
                  value={settings.sttProvider}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, sttProvider: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">Web Speech API</SelectItem>
                    <SelectItem value="openai">OpenAI Whisper</SelectItem>
                    <SelectItem value="google">Google Speech-to-Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={fetchSTTModels} disabled={settings.sttProvider !== 'web'}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Load Models
                </Button>
              </div>

              {sttModels.length > 0 && (
                <div>
                  <Label htmlFor="sttModel">STT Model</Label>
                  <Select
                    value={settings.sttModel}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, sttModel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {sttModels.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Internet Research & Content Generation</CardTitle>
          <CardDescription>
            Enable AI-powered internet research and automatic content generation for personalized learning materials.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="enableInternetSearch"
              checked={settings.enableInternetSearch}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableInternetSearch: checked }))}
            />
            <Label htmlFor="enableInternetSearch">Enable Internet Research</Label>
          </div>

          <Alert>
            <AlertDescription>
              When enabled, AI will automatically search the internet for relevant educational materials,
              exercises, and resources based on your learning goals. The AI considers your language,
              country, and education level to provide culturally and educationally appropriate content.
            </AlertDescription>
          </Alert>

          {settings.enableInternetSearch && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="searchProvider">Search Provider</Label>
                  <Select
                    value={settings.searchProvider}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, searchProvider: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="serpapi">SerpAPI (Google Search)</SelectItem>
                      <SelectItem value="bing">Bing Search API</SelectItem>
                      <SelectItem value="duckduckgo">DuckDuckGo Search</SelectItem>
                      <SelectItem value="searx">SearX (Self-hosted)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="searchApiKey">Search API Key</Label>
                  <Input
                    id="searchApiKey"
                    type="password"
                    value={settings.searchApiKey}
                    onChange={(e) => setSettings(prev => ({ ...prev, searchApiKey: e.target.value }))}
                    placeholder="Enter your search API key"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="userLanguage">Language</Label>
                  <Select
                    value={settings.userLanguage}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, userLanguage: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sl">Slovenian (Slovenija)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="it">Italian</SelectItem>
                      <SelectItem value="hr">Croatian</SelectItem>
                      <SelectItem value="sr">Serbian</SelectItem>
                      <SelectItem value="bs">Bosnian</SelectItem>
                      <SelectItem value="mk">Macedonian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="userCountry">Country</Label>
                  <Select
                    value={settings.userCountry}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, userCountry: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SI">Slovenia</SelectItem>
                      <SelectItem value="HR">Croatia</SelectItem>
                      <SelectItem value="BA">Bosnia and Herzegovina</SelectItem>
                      <SelectItem value="RS">Serbia</SelectItem>
                      <SelectItem value="ME">Montenegro</SelectItem>
                      <SelectItem value="MK">North Macedonia</SelectItem>
                      <SelectItem value="AT">Austria</SelectItem>
                      <SelectItem value="IT">Italy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="educationLevel">Education Level</Label>
                  <Select
                    value={settings.educationLevel}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, educationLevel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary School</SelectItem>
                      <SelectItem value="secondary">Secondary School</SelectItem>
                      <SelectItem value="vocational">Vocational School</SelectItem>
                      <SelectItem value="university">University</SelectItem>
                      <SelectItem value="graduate">Graduate Studies</SelectItem>
                      <SelectItem value="professional">Professional Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>Smart Research Features:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Automatic topic detection and search query generation</li>
                    <li>Country-specific educational content filtering</li>
                    <li>Curriculum-aligned material selection</li>
                    <li>Exercise generation based on found materials</li>
                    <li>Integration with your uploaded materials</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Mentor Persona</CardTitle>
          <CardDescription>
            Choose your AI mentor&apos;s personality to make learning more engaging and personalized.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="mentorPersona">Mentor Personality</Label>
            <Select
              value={settings.mentorPersona}
              onValueChange={(value) => setSettings(prev => ({ ...prev, mentorPersona: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select mentor persona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strict-coach">
                  <div className="flex flex-col">
                    <span className="font-medium">Strict Coach</span>
                    <span className="text-sm text-muted-foreground">Disciplined, goal-oriented, pushes you to excel</span>
                  </div>
                </SelectItem>
                <SelectItem value="friendly-grandma">
                  <div className="flex flex-col">
                    <span className="font-medium">Friendly Grandma</span>
                    <span className="text-sm text-muted-foreground">Warm, encouraging, patient, and nurturing</span>
                  </div>
                </SelectItem>
                <SelectItem value="scientist">
                  <div className="flex flex-col">
                    <span className="font-medium">Scientist</span>
                    <span className="text-sm text-muted-foreground">Analytical, curious, explains concepts deeply</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Alert>
            <AlertDescription>
              <strong>Mentor Personas:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Strict Coach:</strong> Motivates through discipline and high expectations</li>
                <li><strong>Friendly Grandma:</strong> Creates emotional connection with warmth and patience</li>
                <li><strong>Scientist:</strong> Focuses on deep understanding and analytical thinking</li>
              </ul>
              Your mentor&apos;s personality will influence how the AI communicates and guides your learning journey.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Settings
        </Button>
      </div>
    </div>
  );
}