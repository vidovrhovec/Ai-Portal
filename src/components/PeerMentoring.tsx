'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Users,
  Calendar,
  Star,
  GraduationCap,
  Clock,
  CheckCircle
} from 'lucide-react';

interface Mentor {
  id: string;
  name: string;
  avatar?: string;
  subjects: string[];
  grade: string;
  rating: number;
  totalSessions: number;
  bio: string;
  availability: string[];
  isOnline: boolean;
}

interface MentoringSession {
  id: string;
  mentorId: string;
  menteeId: string;
  subject: string;
  scheduledAt: string;
  duration: number; // minutes
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
}

interface PeerMentoringProps {
  userId: string;
  userSubjects: string[];
}

export function PeerMentoring({ userId, userSubjects }: PeerMentoringProps) {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [sessions, setSessions] = useState<MentoringSession[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [sessionRequest, setSessionRequest] = useState({
    subject: '',
    topic: '',
    preferredTime: '',
    duration: 30,
    notes: ''
  });

  const loadMentors = async () => {
    try {
      const response = await fetch('/api/mentoring/mentors');
      const data = await response.json();
      setMentors(data.mentors || []);
    } catch (error) {
      console.error('Failed to load mentors:', error);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/mentoring/sessions');
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const requestSession = async () => {
    if (!selectedMentor) return;

    try {
      const response = await fetch('/api/mentoring/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId: selectedMentor.id,
          subject: sessionRequest.subject,
          topic: sessionRequest.topic,
          preferredTime: sessionRequest.preferredTime,
          duration: sessionRequest.duration,
          notes: sessionRequest.notes
        })
      });

      if (response.ok) {
        loadSessions();
        setSelectedMentor(null);
        setSessionRequest({
          subject: '',
          topic: '',
          preferredTime: '',
          duration: 30,
          notes: ''
        });
      }
    } catch (error) {
      console.error('Failed to request session:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await loadMentors();
      await loadSessions();
    };
    loadData();
  }, []);

  const filteredMentors = mentors.filter(mentor =>
    (!selectedSubject || mentor.subjects.includes(selectedSubject)) &&
    mentor.isOnline
  );

  const upcomingSessions = sessions.filter(session =>
    session.menteeId === userId &&
    session.status === 'scheduled' &&
    new Date(session.scheduledAt) > new Date()
  );

  return (
    <div className="space-y-6">
      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Prihajajoče seje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingSessions.map((session) => {
                const mentor = mentors.find(m => m.id === session.mentorId);
                return (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{mentor?.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{mentor?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.subject} - {new Date(session.scheduledAt).toLocaleString('sl-SI')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {session.duration}min
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Find Mentors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Najdi mentorja
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Subject Filter */}
            <div>
              <label className="text-sm font-medium">Predmet</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Izberi predmet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Vsi predmeti</SelectItem>
                  {userSubjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mentors List */}
            <div className="grid gap-4 md:grid-cols-2">
              {filteredMentors.map((mentor) => (
                <Card key={mentor.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>{mentor.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{mentor.name}</h4>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{mentor.rating.toFixed(1)}</span>
                          </div>
                          {mentor.isOnline && (
                            <Badge variant="default" className="text-xs">Online</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{mentor.bio}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {mentor.subjects.slice(0, 3).map(subject => (
                            <Badge key={subject} variant="secondary" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            {mentor.grade}
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {mentor.totalSessions} sej
                          </span>
                        </div>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full mt-3"
                          onClick={() => setSelectedMentor(mentor)}
                        >
                          Zahtevaj sejo
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Zahtevaj mentorsko sejo z {mentor.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Predmet</label>
                            <Select
                              value={sessionRequest.subject}
                              onValueChange={(value) => setSessionRequest(prev => ({ ...prev, subject: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Izberi predmet" />
                              </SelectTrigger>
                              <SelectContent>
                                {mentor.subjects.map(subject => (
                                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Tema</label>
                            <Textarea
                              placeholder="Opiši, s čim potrebuješ pomoč..."
                              value={sessionRequest.topic}
                              onChange={(e) => setSessionRequest(prev => ({ ...prev, topic: e.target.value }))}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Željeni čas</label>
                            <Select
                              value={sessionRequest.preferredTime}
                              onValueChange={(value) => setSessionRequest(prev => ({ ...prev, preferredTime: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Izberi čas" />
                              </SelectTrigger>
                              <SelectContent>
                                {mentor.availability.map(time => (
                                  <SelectItem key={time} value={time}>{time}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Trajanje (minute)</label>
                            <Select
                              value={sessionRequest.duration.toString()}
                              onValueChange={(value) => setSessionRequest(prev => ({ ...prev, duration: parseInt(value) }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="30">30 minut</SelectItem>
                                <SelectItem value="45">45 minut</SelectItem>
                                <SelectItem value="60">60 minut</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Dodatne opombe</label>
                            <Textarea
                              placeholder="Kakršne koli dodatne informacije..."
                              value={sessionRequest.notes}
                              onChange={(e) => setSessionRequest(prev => ({ ...prev, notes: e.target.value }))}
                            />
                          </div>
                          <Button onClick={requestSession} className="w-full">
                            Pošlji zahtevo
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}