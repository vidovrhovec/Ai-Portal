'use client';

import React, { useState } from 'react';
import { Session } from 'next-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LiveStudyRooms } from '@/components/LiveStudyRooms';
import { PeerMentoring } from '@/components/PeerMentoring';
import { CollaborativeCanvas } from '@/components/CollaborativeCanvas';
import {
  Users,
  GraduationCap,
  Palette,
  MessageSquare
} from 'lucide-react';

interface SocialSectionProps {
  session: Session;
}

export function SocialSection({ session }: SocialSectionProps) {
  const [activeCanvasId, setActiveCanvasId] = useState<string>('default-canvas');

  const userId = session.user?.id || '';
  const userName = session.user?.name || '';
  const userGrade = '3. letnik'; // This should come from user profile
  const userSubjects = ['Matematika', 'Slovenščina', 'Angleščina', 'Fizika']; // This should come from user profile

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-card-foreground mb-2">Skupnost</h2>
        <p className="text-muted-foreground">
          Pridruži se skupnemu učenju, najdi mentorja ali sodeluj na interaktivnih platnih
        </p>
      </div>

      <Tabs defaultValue="study-rooms" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="study-rooms" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Žive učilnice
          </TabsTrigger>
          <TabsTrigger value="mentoring" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Mentoring
          </TabsTrigger>
          <TabsTrigger value="canvas" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Skupna platna
          </TabsTrigger>
        </TabsList>

        <TabsContent value="study-rooms" className="space-y-4">
          <LiveStudyRooms userId={userId} userName={userName} />
        </TabsContent>

        <TabsContent value="mentoring" className="space-y-4">
          <PeerMentoring
            userId={userId}
            userSubjects={userSubjects}
          />
        </TabsContent>

        <TabsContent value="canvas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Kolaborativna platna
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Sodeluj v realnem času z drugimi študenti na interaktivnih platnih
              </p>
            </CardHeader>
            <CardContent>
              <CollaborativeCanvas
                canvasId={activeCanvasId}
                groupId="general"
                userId={userId}
                userName={userName}
                className="w-full h-96 border rounded"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}