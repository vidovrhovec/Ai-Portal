'use client';

import { useEffect, useRef, useState } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Settings, Users, MessageSquare } from 'lucide-react';
import { useSession } from 'next-auth/react';

async function sendJitsiTelemetry(payload: any) {
  try {
    await fetch('/api/telemetry/jitsi-errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Non-blocking telemetry; do not surface errors to users
    // Keep silent but log to console for local debugging
     
    console.warn('Failed to send Jitsi telemetry', err);
  }
}

interface VideoConferenceProps {
  roomId?: string;
  roomName?: string;
  isHost?: boolean;
  onMeetingEnd?: () => void;
}

export function VideoConference({
  roomId,
  roomName = 'AI Learning Session',
  isHost = false,
  onMeetingEnd
}: VideoConferenceProps) {
  const { data: session } = useSession();
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [meetingId, setMeetingId] = useState(roomId || `ai-learning-${Date.now()}`);
  const [jitsiLoading, setJitsiLoading] = useState(false);
  const [jitsiError, setJitsiError] = useState<string | null>(null);

  async function loadJitsiExternalApi(domain = 'meet.jit.si', release?: string, appId?: string) {
    if ((window as any).JitsiMeetExternalAPI) return (window as any).JitsiMeetExternalAPI;
    return new Promise<any>((resolve, reject) => {
      try {
        const script = document.createElement('script');
        const releaseParam = release ? `?release=${release}` : '';
        const appIdPath = appId ? `${appId}/` : '';
        script.async = true;
        script.src = `https://${domain}/${appIdPath}external_api.js${releaseParam}`;
        script.onload = () => resolve((window as any).JitsiMeetExternalAPI);
        script.onerror = () => reject(new Error(`Script load error: ${script.src}`));
        document.head.appendChild(script);
      } catch (e) {
        reject(e);
      }
    });
  }

  const handleMeetingJoin = async () => {
    setJitsiError(null);
    setJitsiLoading(true);
    try {
      await loadJitsiExternalApi();
      setIsJoined(true);
    } catch (e: any) {
      console.error('Jitsi load failed:', e?.message || e);
      const errMsg = String(e?.message || e);
      setJitsiError(errMsg);
      setIsJoined(false);

      // Fire-and-forget telemetry with environment details
      void sendJitsiTelemetry({
        event: 'jitsi_load_error',
        meetingId,
        error: errMsg,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : null,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        platform: typeof navigator !== 'undefined' ? navigator.platform : null,
        language: typeof navigator !== 'undefined' ? navigator.language : null,
        online: typeof navigator !== 'undefined' ? navigator.onLine : null,
        connection: typeof (navigator as any) !== 'undefined' && (navigator as any).connection ? {
          effectiveType: (navigator as any).connection.effectiveType,
          downlink: (navigator as any).connection.downlink,
          rtt: (navigator as any).connection.rtt,
        } : null,
        sessionUser: session?.user ? { id: (session.user as any).id, email: (session.user as any).email } : null,
      });
    } finally {
      setJitsiLoading(false);
    }
  };

  const handleMeetingLeave = () => {
    setIsJoined(false);
    onMeetingEnd?.();
  };

  const handleParticipantUpdate = (participants: any[]) => {
    setParticipantCount(participants.length);
  };

  if (!session?.user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <VideoOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p>Please sign in to join video conferences</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full h-full min-h-[600px]">
      {!isJoined ? (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Join Video Conference
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="roomName">Room Name</Label>
              <Input
                id="roomName"
                value={roomName}
                readOnly
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="meetingId">Meeting ID</Label>
              <Input
                id="meetingId"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
                className="mt-1"
              />
            </div>
            {jitsiError ? (
              <div className="space-y-3">
                <p className="text-sm text-red-600">Failed to load video engine: {jitsiError}</p>
                <p className="text-xs text-muted-foreground">Check network access to <code>meet.jit.si</code> or disable ad-blockers that block external scripts.</p>
                <div className="flex space-x-2">
                  <Button onClick={() => { setJitsiError(null); handleMeetingJoin(); }}>Retry</Button>
                  <Button variant="ghost" onClick={() => setJitsiError(null)}>Cancel</Button>
                  <Button variant="outline" onClick={() => window.open(`https://meet.jit.si/${encodeURIComponent(meetingId)}`, '_blank')}>Open in Jitsi (new tab)</Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleMeetingJoin}
                className="w-full"
                size="lg"
                disabled={jitsiLoading}
              >
                <Video className="h-4 w-4 mr-2" />
                {jitsiLoading ? 'Loading...' : 'Join Meeting'}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="relative w-full h-full">
          {/* Meeting Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="sm"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                variant={isVideoOff ? "destructive" : "secondary"}
                size="sm"
                onClick={() => setIsVideoOff(!isVideoOff)}
              >
                {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowChat(!showChat)}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleMeetingLeave}
              >
                <PhoneOff className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Participant Count */}
          <div className="absolute top-4 right-4 z-10">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {participantCount}
            </Badge>
          </div>

          {/* Jitsi Meeting */}
          <JitsiMeeting
            roomName={meetingId}
            onApiReady={(api: any) => {
              api.addEventListener('participantJoined', (participant: any) => {
                console.log('Participant joined:', participant);
              });
              api.addEventListener('participantLeft', (participant: any) => {
                console.log('Participant left:', participant);
              });
              api.addEventListener('videoConferenceJoined', () => {
                console.log('Joined conference');
              });
              api.addEventListener('videoConferenceLeft', () => {
                handleMeetingLeave();
              });
            }}
            getIFrameRef={(iframeRef: any) => {
              iframeRef.style.height = '100%';
              iframeRef.style.width = '100%';
            }}
          />
        </div>
      )}
    </div>
  );
}