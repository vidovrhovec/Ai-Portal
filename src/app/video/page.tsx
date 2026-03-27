'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VideoConference } from '@/components/VideoConference';
import { VideoPlayer } from '@/components/VideoPlayer';
import { VideoNotes } from '@/components/VideoNotes';
import {
  Video,
  Play,
  Users,
  Plus,
  Calendar,
  Clock,
  Eye,
  MessageSquare,
  Settings
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { sl } from 'date-fns/locale';

interface VideoMaterial {
  id: string;
  title: string;
  type: string;
  url?: string;
  duration?: number;
  thumbnailUrl?: string;
  isLive: boolean;
  meetingId?: string;
  createdAt: string;
  course?: {
    title: string;
    id: string;
  };
  teacher: {
    name: string;
    id: string;
  };
  materialProgresses: Array<{
    completed: boolean;
    lastAccessed: string;
  }>;
  _count: {
    videoNotes: number;
  };
}

export default function VideoHubPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('recorded');
  const [selectedVideo, setSelectedVideo] = useState<VideoMaterial | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    type: 'video',
    courseId: '',
    url: '',
    content: '',
  });

  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await fetch('/api/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      return response.json();
    },
    enabled: !!session?.user,
  });

  const { data: videos, isLoading } = useQuery({
    queryKey: ['videos', activeTab],
    queryFn: async () => {
      const type = activeTab === 'live' ? 'live' : activeTab === 'recorded' ? 'recorded' : null;
      const params = new URLSearchParams();
      if (type) params.set('type', type);

      const response = await fetch(`/api/materials/video?${params}`);
      if (!response.ok) throw new Error('Failed to fetch videos');
      return response.json() as Promise<VideoMaterial[]>;
    },
    enabled: !!session?.user,
  });

  const createVideoMutation = useMutation({
    mutationFn: async (data: typeof createForm) => {
      const response = await fetch('/api/materials/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create video');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      setShowCreateDialog(false);
      setCreateForm({
        title: '',
        type: 'video',
        courseId: '',
        url: '',
        content: '',
      });
    },
  });

  const handleCreateVideo = () => {
    createVideoMutation.mutate(createForm);
  };

  const handleJoinMeeting = (video: VideoMaterial) => {
    if (video.meetingId) {
      router.push(`/video/meeting/${video.meetingId}`);
    }
  };

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Video Hub</h1>
          <p className="text-muted-foreground">Watch recorded lessons and join live sessions</p>
        </div>
        {session.user.role === 'TEACHER' && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Video
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Video Content</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={createForm.title}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Video title"
                  />
                </div>
                <div>
                  <Label htmlFor="course">Course (Optional)</Label>
                  <Select
                    value={createForm.courseId}
                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, courseId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses?.map((course: any) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="url">Video URL</Label>
                  <Input
                    id="url"
                    value={createForm.url}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="content">Description</Label>
                  <Textarea
                    id="content"
                    value={createForm.content}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Video description"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateVideo}
                    disabled={createVideoMutation.isPending}
                    className="flex-1"
                  >
                    {createVideoMutation.isPending ? 'Creating...' : 'Create Video'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recorded">Recorded Videos</TabsTrigger>
          <TabsTrigger value="live">Live Sessions</TabsTrigger>
          <TabsTrigger value="all">All Videos</TabsTrigger>
        </TabsList>

        <TabsContent value="recorded" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos?.filter(v => !v.isLive && v.url)?.map((video) => (
              <Card key={video.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <div
                    className="aspect-video bg-muted rounded-t-lg flex items-center justify-center relative"
                    onClick={() => setSelectedVideo(video)}
                  >
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <Video className="h-12 w-12 text-muted-foreground" />
                    )}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                    {video.duration && (
                      <Badge className="absolute bottom-2 right-2 bg-black/70">
                        {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg mb-2">{video.title}</CardTitle>
                  <CardDescription className="mb-3">
                    {video.course?.title && `Course: ${video.course.title}`}
                  </CardDescription>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {video.materialProgresses[0]?.completed ? 'Watched' : 'Not watched'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {video._count.videoNotes}
                      </span>
                    </div>
                    <span>{formatDistanceToNow(new Date(video.createdAt), { locale: sl })}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="live" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos?.filter(v => v.isLive)?.map((video) => (
              <Card key={video.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    {video.title}
                  </CardTitle>
                  <CardDescription>
                    {video.course?.title && `Course: ${video.course.title}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Live session</span>
                    </div>
                    <Button
                      onClick={() => handleJoinMeeting(video)}
                      className="w-full"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Join Meeting
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos?.map((video) => (
              <Card key={video.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {video.isLive ? <Video className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    {video.title}
                  </CardTitle>
                  <CardDescription>
                    {video.course?.title && `Course: ${video.course.title}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={video.isLive ? "destructive" : "secondary"}>
                        {video.isLive ? 'Live' : 'Recorded'}
                      </Badge>
                      {video.duration && (
                        <Badge variant="outline">
                          {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {video.isLive ? (
                        <Button
                          onClick={() => handleJoinMeeting(video)}
                          className="flex-1"
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Join
                        </Button>
                      ) : video.url ? (
                        <Button
                          onClick={() => setSelectedVideo(video)}
                          className="flex-1"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Watch
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Video Player Modal */}
      {selectedVideo && (
        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="max-w-6xl w-full h-[80vh]">
            <DialogHeader>
              <DialogTitle>{selectedVideo.title}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 space-y-4">
              {selectedVideo.url && (
                <VideoPlayer
                  url={selectedVideo.url}
                  title={selectedVideo.title}
                  duration={selectedVideo.duration}
                  className="w-full h-96"
                />
              )}
              <VideoNotes videoId={selectedVideo.id} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}