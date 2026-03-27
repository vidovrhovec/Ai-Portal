'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Monitor,
  Users,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Settings,
  Share,
  StopCircle,
  AlertCircle
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface ScreenSharingProps {
  groupId: string;
  userId: string;
  className?: string;
}

interface Participant {
  id: string;
  name: string;
  isSharing: boolean;
  streamId?: string;
}

export function ScreenSharing({ groupId, userId, className = '' }: ScreenSharingProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Screen sharing settings
  const [settings, setSettings] = useState({
    audio: true,
    video: true,
    quality: 'hd' as 'sd' | 'hd' | 'fhd',
    frameRate: 30
  });

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      auth: { userId }
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      socketInstance.emit('join-group', groupId);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('user-joined', (data) => {
      setParticipants(prev => [...prev.filter(p => p.id !== data.userId), {
        id: data.userId,
        name: data.user.name || `User ${data.userId}`,
        isSharing: false
      }]);
    });

    socketInstance.on('user-left', (data) => {
      setParticipants(prev => prev.filter(p => p.id !== data.userId));
    });

    socketInstance.on('screen-share-started', (data) => {
      setParticipants(prev => prev.map(p =>
        p.id === data.userId
          ? { ...p, isSharing: true, streamId: data.streamId }
          : p
      ));
    });

    socketInstance.on('screen-share-stopped', (data) => {
      setParticipants(prev => prev.map(p =>
        p.id === data.userId
          ? { ...p, isSharing: false, streamId: undefined }
          : p
      ));
    });

    socketRef.current = socketInstance;

    return () => {
      socketInstance.disconnect();
    };
  }, [groupId, userId]);

  // Stop screen sharing
  const stopScreenShare = useCallback(() => {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      setCurrentStream(null);
    }

    setIsSharing(false);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    socketRef.current?.emit('stop-screen-share', { groupId });
  }, [currentStream, groupId]);

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      setError(null);

      // Request screen sharing
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: settings.quality === 'fhd' ? 1920 : settings.quality === 'hd' ? 1280 : 640,
          height: settings.quality === 'fhd' ? 1080 : settings.quality === 'hd' ? 720 : 480,
          frameRate: settings.frameRate
        },
        audio: settings.audio
      });

      setCurrentStream(stream);
      setIsSharing(true);

      // Set video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Notify others
      const streamId = `stream-${Date.now()}`;
      socketRef.current?.emit('start-screen-share', { groupId, streamId });

      // Handle stream end
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stopScreenShare();
      });

    } catch (error) {
      console.error('Error starting screen share:', error);
      setError('Failed to start screen sharing. Please check permissions.');
    }
  }, [settings, groupId, stopScreenShare]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (currentStream) {
      const audioTrack = currentStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setSettings(prev => ({ ...prev, audio: audioTrack.enabled }));
      }
    }
  }, [currentStream]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (currentStream) {
      const videoTrack = currentStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setSettings(prev => ({ ...prev, video: videoTrack.enabled }));
      }
    }
  }, [currentStream]);

  // Check if screen sharing is supported
  const isScreenSharingSupported = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
  };

  if (!isScreenSharingSupported()) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Screen Sharing Not Supported</h3>
            <p className="text-gray-600">
              Your browser doesn&apos;t support screen sharing. Try using Chrome, Edge, or Firefox.
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
          <Monitor className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Screen Sharing</h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
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

      {/* Participants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Participants ({participants.length + 1})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Current user */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  Y
                </div>
                <div>
                  <div className="font-medium">You</div>
                  <div className="text-sm text-gray-500">
                    {isSharing ? 'Sharing screen' : 'Not sharing'}
                  </div>
                </div>
              </div>
              {isSharing && (
                <Badge className="bg-green-100 text-green-800">
                  <Share className="h-3 w-3 mr-1" />
                  Sharing
                </Badge>
              )}
            </div>

            {/* Other participants */}
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{participant.name}</div>
                    <div className="text-sm text-gray-500">
                      {participant.isSharing ? 'Sharing screen' : 'Not sharing'}
                    </div>
                  </div>
                </div>
                {participant.isSharing && (
                  <Badge className="bg-green-100 text-green-800">
                    <Share className="h-3 w-3 mr-1" />
                    Sharing
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Screen Share Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Screen Share Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {!isSharing ? (
              <Button onClick={startScreenShare} className="gap-2">
                <Monitor className="h-5 w-5" />
                Start Sharing
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button onClick={stopScreenShare} variant="destructive" className="gap-2">
                  <StopCircle className="h-5 w-5" />
                  Stop Sharing
                </Button>

                <Button
                  onClick={toggleAudio}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  {settings.audio ? (
                    <Mic className="h-4 w-4" />
                  ) : (
                    <MicOff className="h-4 w-4" />
                  )}
                  Audio
                </Button>

                <Button
                  onClick={toggleVideo}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  {settings.video ? (
                    <Video className="h-4 w-4" />
                  ) : (
                    <VideoOff className="h-4 w-4" />
                  )}
                  Video
                </Button>
              </div>
            )}
          </div>

          {/* Screen Preview */}
          {isSharing && (
            <div className="mt-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-64 object-contain"
                  style={{ maxHeight: '400px' }}
                />
                <div className="absolute top-2 right-2">
                  <Badge className="bg-red-500 text-white">
                    <Monitor className="h-3 w-3 mr-1" />
                    LIVE
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shared Screens */}
      {participants.some(p => p.isSharing) && (
        <Card>
          <CardHeader>
            <CardTitle>Shared Screens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {participants.filter(p => p.isSharing).map((participant) => (
                <div key={participant.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {participant.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{participant.name}</span>
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      <Share className="h-3 w-3 mr-1" />
                      Sharing
                    </Badge>
                  </div>
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '200px' }}>
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <Monitor className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Screen sharing active</p>
                        <p className="text-xs">Content will appear here</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Screen Sharing Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Video Quality</label>
              <Select
                value={settings.quality}
                onValueChange={(value: 'sd' | 'hd' | 'fhd') =>
                  setSettings(prev => ({ ...prev, quality: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sd">SD (640x480)</SelectItem>
                  <SelectItem value="hd">HD (1280x720)</SelectItem>
                  <SelectItem value="fhd">Full HD (1920x1080)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Frame Rate</label>
              <Select
                value={settings.frameRate.toString()}
                onValueChange={(value) =>
                  setSettings(prev => ({ ...prev, frameRate: parseInt(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 FPS</SelectItem>
                  <SelectItem value="30">30 FPS</SelectItem>
                  <SelectItem value="60">60 FPS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Include Audio</span>
              <Button
                variant={settings.audio ? "default" : "outline"}
                size="sm"
                onClick={() => setSettings(prev => ({ ...prev, audio: !prev.audio }))}
              >
                {settings.audio ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}