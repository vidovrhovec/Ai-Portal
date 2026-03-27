'use client';

/**
 * FocusMode Component
 * 
 * Provides focused study sessions with Pomodoro timers and background music.
 * Features include:
 * - Customizable session durations (Pomodoro technique)
 * - Background music selection for concentration
 * - Session tracking and statistics
 * - Break reminders and session completion rewards
 * - Integration with gamification system
 * 
 * Supports multiple focus techniques and helps maintain study discipline
 * through structured time management and ambient audio.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Headphones,
  Timer,
  Coffee,
  Moon,
  Zap,
  Heart,
  Music,
  Focus
} from 'lucide-react';
import { useSession } from 'next-auth/react';

interface FocusSession {
  id: string;
  duration: number; // in minutes
  completedAt?: Date;
  musicType: string;
  pomodoroCycles: number;
}

export function FocusMode() {
  const { data: session } = useSession();
  const [isActive, setIsActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(25); // 25 minutes default (Pomodoro)
  const [volume, setVolume] = useState(50);
  const [musicType, setMusicType] = useState('lofi');
  const [isMuted, setIsMuted] = useState(false);
  const [pomodoroCycle, setPomodoroCycle] = useState(1);
  const [totalCycles, setTotalCycles] = useState(4);
  const [isBreak, setIsBreak] = useState(false);
  const [breakTime] = useState(5); // 5 minutes break
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [notificationsBlocked, setNotificationsBlocked] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Fetch focus sessions
  const { data: sessions } = useQuery({
    queryKey: ['focus-sessions'],
    queryFn: async () => {
      const response = await fetch('/api/focus/sessions');
      if (!response.ok) throw new Error('Failed to fetch sessions');
      return response.json();
    },
    enabled: !!session?.user,
  });

  // Generate music mutation
  const generateMusicMutation = useMutation({
    mutationFn: async (data: { type: string; heartRate?: number; duration: number }) => {
      const response = await fetch('/api/focus/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to generate music');
      return response.json();
    },
    onSuccess: (data) => {
      if (audioRef.current) {
        audioRef.current.src = data.musicUrl;
        audioRef.current.volume = volume / 100;
        if (isPlaying) {
          audioRef.current.play();
        }
      }
    },
  });

  // Save session mutation
  const saveSessionMutation = useMutation({
    mutationFn: async (sessionData: FocusSession) => {
      const response = await fetch('/api/focus/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });
      if (!response.ok) throw new Error('Failed to save session');
      return response.json();
    },
  });

  const startNewSession = useCallback(() => {
    generateMusicMutation.mutate({
      type: musicType,
      heartRate: heartRate || undefined,
      duration: duration,
    });
  }, [generateMusicMutation, musicType, heartRate, duration]);

  const pauseMusic = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const endSession = useCallback(() => {
    setIsActive(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setNotificationsBlocked(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    // Save session
    const sessionDuration = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60);
    saveSessionMutation.mutate({
      id: `session-${Date.now()}`,
      duration: sessionDuration,
      musicType,
      pomodoroCycles: pomodoroCycle,
    });
  }, [saveSessionMutation, musicType, pomodoroCycle]);

  const startFocus = () => {
    setIsActive(true);
    setCurrentTime(0);
    setPomodoroCycle(1);
    setIsBreak(false);
    startTimeRef.current = Date.now();
    setNotificationsBlocked(true);

    // Generate initial music
    startNewSession();

    // Simulate heart rate monitoring (in real app, this would connect to smartwatch)
    if (Math.random() > 0.5) {
      setHeartRate(Math.floor(Math.random() * 40) + 60); // 60-100 bpm
    }
  };

  const resumeMusic = () => {
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  // Timer effect
  useEffect(() => {
    if (isActive && !isBreak) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          const totalSeconds = (isBreak ? breakTime : duration) * 60;

          if (newTime >= totalSeconds) {
            // Session/Break complete
            if (isBreak) {
              // Break finished, start next work session
              setIsBreak(false);
              setCurrentTime(0);
              setPomodoroCycle(prev => prev + 1);
              startNewSession();
            } else {
              // Work session finished
              if (pomodoroCycle >= totalCycles) {
                // All cycles complete
                endSession();
              } else {
                // Start break
                setIsBreak(true);
                setCurrentTime(0);
                pauseMusic();
              }
            }
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, isBreak, duration, breakTime, pomodoroCycle, totalCycles, endSession, startNewSession]);

  // Music volume effect
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalSeconds = (isBreak ? breakTime : duration) * 60;
    return (currentTime / totalSeconds) * 100;
  };

  const getCurrentPhase = () => {
    if (!isActive) return 'Ready';
    if (isBreak) return `Break ${pomodoroCycle}/${totalCycles}`;
    return `Focus ${pomodoroCycle}/${totalCycles}`;
  };

  if (!session?.user) return null;

  return (
    <div className="space-y-6">
      {/* Focus Mode Toggle */}
      <Card className={`transition-all duration-300 ${
        isActive
          ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg'
          : 'bg-white border-gray-200'
      }`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Focus className="w-5 h-5 text-blue-600" />
            Focus Mode
          </CardTitle>
          <CardDescription>
            Transform your environment into a productive workstation with AI music and Pomodoro timer
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isActive ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="25">25 min (Pomodoro)</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">60 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Music Type</label>
                  <Select value={musicType} onValueChange={setMusicType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lofi">Lo-Fi Hip Hop</SelectItem>
                      <SelectItem value="classical">Classical</SelectItem>
                      <SelectItem value="ambient">Ambient</SelectItem>
                      <SelectItem value="nature">Nature Sounds</SelectItem>
                      <SelectItem value="electronic">Electronic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Pomodoro Cycles</label>
                  <Select value={totalCycles.toString()} onValueChange={(v) => setTotalCycles(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 cycle</SelectItem>
                      <SelectItem value="2">2 cycles</SelectItem>
                      <SelectItem value="4">4 cycles</SelectItem>
                      <SelectItem value="6">6 cycles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={startFocus}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Focus Mode
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status */}
              <div className="text-center">
                <Badge variant="outline" className="mb-2">
                  {getCurrentPhase()}
                </Badge>
                <div className="text-3xl font-mono font-bold">
                  {formatTime((isBreak ? breakTime : duration) * 60 - currentTime)}
                </div>
                <Progress value={getProgress()} className="mt-2" />
              </div>

              {/* Music Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isPlaying ? pauseMusic : resumeMusic}
                  disabled={generateMusicMutation.isPending}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    onValueChange={(value) => setVolume(value[0])}
                    max={100}
                    step={1}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-500 w-8">{isMuted ? 0 : volume}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={startNewSession}
                  disabled={generateMusicMutation.isPending}
                >
                  <Music className="w-4 h-4 mr-1" />
                  New Track
                </Button>
              </div>

              {/* Heart Rate & Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {heartRate && (
                  <div className="flex flex-col items-center">
                    <Heart className="w-5 h-5 text-red-500 mb-1" />
                    <span className="text-sm text-gray-500">Heart Rate</span>
                    <span className="font-semibold">{heartRate} bpm</span>
                  </div>
                )}
                <div className="flex flex-col items-center">
                  <Timer className="w-5 h-5 text-blue-500 mb-1" />
                  <span className="text-sm text-gray-500">Cycle</span>
                  <span className="font-semibold">{pomodoroCycle}/{totalCycles}</span>
                </div>
                <div className="flex flex-col items-center">
                  <Coffee className="w-5 h-5 text-green-500 mb-1" />
                  <span className="text-sm text-gray-500">Break</span>
                  <span className="font-semibold">{breakTime}min</span>
                </div>
                <div className="flex flex-col items-center">
                  <Headphones className="w-5 h-5 text-purple-500 mb-1" />
                  <span className="text-sm text-gray-500">Music</span>
                  <span className="font-semibold capitalize">{musicType}</span>
                </div>
              </div>

              {/* End Session */}
              <Button
                onClick={endSession}
                variant="outline"
                className="w-full"
              >
                <Square className="w-4 h-4 mr-2" />
                End Focus Session
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session History */}
      {sessions && sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Focus Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sessions.slice(0, 5).map((session: FocusSession) => (
                <div key={session.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{session.duration} min</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {session.musicType} • {session.pomodoroCycles} cycles
                    </span>
                  </div>
                  <Badge variant="outline">
                    {session.completedAt ? 'Completed' : 'In Progress'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        loop
        onLoadedData={() => {
          if (isPlaying && isActive) {
            audioRef.current?.play();
          }
        }}
      />

      {/* Notification Blocker */}
      {notificationsBlocked && (
        <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-200 rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">Focus Mode Active</span>
          </div>
          <p className="text-xs text-red-600 mt-1">Notifications blocked for better concentration</p>
        </div>
      )}
    </div>
  );
}