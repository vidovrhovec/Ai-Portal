'use client';

import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { VideoConference } from '@/components/VideoConference';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Calendar, Clock } from 'lucide-react';

interface MeetingMaterial {
  id: string;
  title: string;
  content?: string;
  meetingId?: string;
  course?: {
    title: string;
  };
  teacher: {
    name: string;
  };
  createdAt: string;
}

export default function MeetingPage() {
  const params = useParams();
  const meetingId = params?.id as string;
  const { data: session } = useSession();
  const router = useRouter();

  const { data: meeting, isLoading } = useQuery({
    queryKey: ['meeting', meetingId],
    queryFn: async () => {
      // If meetingId is "new", return null to indicate a new meeting should be created
      if (meetingId === 'new') {
        return null;
      }

      const response = await fetch(`/api/materials/video?meetingId=${meetingId}`);
      if (!response.ok) throw new Error('Failed to fetch meeting');
      const meetings = await response.json();
      const foundMeeting = meetings.find((m: MeetingMaterial) => m.meetingId === meetingId);

      if (!foundMeeting) {
        throw new Error('Meeting not found');
      }

      return foundMeeting;
    },
    enabled: !!meetingId && !!session?.user,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">
              Please sign in to join this video meeting.
            </p>
            <Button onClick={() => router.push('/login')}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!meeting) {
    if (meetingId === 'new') {
      // This is a new meeting, show the conference directly
      return (
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => router.push('/video')}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Video Hub
              </Button>
              <h1 className="text-3xl font-bold">New Video Conference</h1>
              <p className="text-muted-foreground">Start a new video meeting</p>
            </div>

            <VideoConference
              roomName={`ai-learning-${Date.now()}`}
              isHost={true}
              onMeetingEnd={() => router.push('/video')}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Meeting Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The meeting you're looking for doesn't exist or has ended.
            </p>
            <Button onClick={() => router.push('/video')}>
              Back to Video Hub
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/video')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Video Hub
              </Button>
              <div>
                <h1 className="text-xl font-semibold">{meeting.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {meeting.teacher.name}
                  </span>
                  {meeting.course && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {meeting.course.title}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(meeting.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="animate-pulse">
                LIVE
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Meeting Description */}
          {meeting.content && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Meeting Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{meeting.content}</p>
              </CardContent>
            </Card>
          )}

          {/* Video Conference */}
          <Card>
            <CardContent className="p-0">
              <VideoConference
                roomId={meetingId}
                roomName={meeting.title}
                isHost={meeting.teacher.name === session.user.name}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}