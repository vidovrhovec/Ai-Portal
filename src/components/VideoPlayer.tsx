'use client';

import { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  SkipBack,
  SkipForward,
  RotateCcw
} from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface VideoPlayerProps {
  url: string;
  title?: string;
  thumbnail?: string;
  duration?: number;
  onProgress?: (progress: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void;
  onDuration?: (duration: number) => void;
  onEnded?: () => void;
  className?: string;
}

export function VideoPlayer({
  url,
  title,
  thumbnail,
  duration: initialDuration,
  onProgress,
  onDuration,
  onEnded,
  className = ''
}: VideoPlayerProps) {
  const playerRef = useRef<any>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const [seeking, setSeeking] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeout) clearTimeout(controlsTimeout);
      const timeout = setTimeout(() => setShowControls(false), 3000);
      setControlsTimeout(timeout);
    };

    const playerElement = playerRef.current?.getInternalPlayer();
    if (playerElement) {
      playerElement.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (controlsTimeout) clearTimeout(controlsTimeout);
      if (playerElement) {
        playerElement.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [controlsTimeout]);

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setMuted(value[0] === 0);
  };

  const handleSeekChange = (value: number[]) => {
    setPlayed(value[0]);
    if (playerRef.current) {
      playerRef.current.seekTo(value[0], 'fraction');
    }
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekMouseUp = () => {
    setSeeking(false);
  };

  const handleProgress = (progress: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => {
    if (!seeking) {
      setPlayed(progress.played);
    }
    onProgress?.(progress);
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
    onDuration?.(duration);
  };

  const handleRewind = () => {
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(Math.max(0, currentTime - 10), 'seconds');
    }
  };

  const handleForward = () => {
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(currentTime + 10, 'seconds');
    }
  };

  const handleRestart = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(0, 'fraction');
      setPlaying(true);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.getInternalPlayer()?.parentElement?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  return (
    <Card className={`relative overflow-hidden bg-black ${className}`}>
      <CardContent className="p-0">
        <div
          className="relative group"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          {(ReactPlayer as any)({
            url,
            playing,
            volume,
            muted,
            onEnded,
            width: '100%',
            height: '100%',
            style: { position: 'absolute', top: 0, left: 0 },
            controls: false
          })}

          {/* Video Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

          {/* Title */}
          {title && (
            <div className="absolute top-4 left-4 right-4 z-10">
              <h3 className="text-white font-medium text-lg drop-shadow-lg">{title}</h3>
            </div>
          )}

          {/* Controls */}
          <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
            {/* Progress Bar */}
            <div className="mb-4">
              <Slider
                value={[played]}
                onValueChange={handleSeekChange}
                onMouseDown={handleSeekMouseDown}
                onMouseUp={handleSeekMouseUp}
                max={1}
                step={0.001}
                className="w-full"
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRestart}
                  className="text-white hover:text-white hover:bg-white/20"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRewind}
                  className="text-white hover:text-white hover:bg-white/20"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayPause}
                  className="text-white hover:text-white hover:bg-white/20"
                >
                  {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleForward}
                  className="text-white hover:text-white hover:bg-white/20"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>

                {/* Volume Control */}
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMuted(!muted)}
                    className="text-white hover:text-white hover:bg-white/20"
                  >
                    {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <div className="w-20">
                    <Slider
                      value={[muted ? 0 : volume]}
                      onValueChange={handleVolumeChange}
                      max={1}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Time Display */}
                <div className="text-white text-sm font-mono">
                  {formatTime(played * duration)} / {formatTime(duration)}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:text-white hover:bg-white/20"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}