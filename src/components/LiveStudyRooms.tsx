'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Users,
  MessageSquare,
  Plus,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Clock,
  Crown
} from 'lucide-react';

interface StudyRoom {
  id: string;
  name: string;
  description: string;
  subject: string;
  maxParticipants: number;
  currentParticipants: number;
  participants: RoomParticipant[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

interface RoomParticipant {
  id: string;
  name: string;
  avatar?: string;
  role: 'host' | 'participant';
  joinedAt: string;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'system';
}

interface LiveStudyRoomsProps {
  userId: string;
  userName: string;
}

export function LiveStudyRooms({ userId, userName }: LiveStudyRoomsProps) {
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<StudyRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isStudyTimerActive, setIsStudyTimerActive] = useState(false);
  const [studyTime, setStudyTime] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const loadRooms = async () => {
    try {
      const response = await fetch('/api/study-rooms');
      const data = await response.json();
      setRooms(data.rooms || []);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    }
  };

  const createRoom = async (name: string, description: string, subject: string) => {
    try {
      const response = await fetch('/api/study-rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, subject, maxParticipants: 10 })
      });
      const data = await response.json();
      if (data.room) {
        setRooms(prev => [...prev, data.room]);
        setCurrentRoom(data.room);
        socket?.emit('join-study-room', { roomId: data.room.id, userId, userName });
      }
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const joinRoom = async (roomId: string) => {
    try {
      const response = await fetch(`/api/study-rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (response.ok) {
        const room = rooms.find(r => r.id === roomId);
        if (room) {
          setCurrentRoom(room);
          socket?.emit('join-study-room', { roomId, userId, userName });
        }
      }
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  };

  const leaveRoom = () => {
    if (currentRoom) {
      socket?.emit('leave-study-room', { roomId: currentRoom.id });
      setCurrentRoom(null);
      setMessages([]);
    }
  };

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      auth: { userId, userName }
    });

    socketInstance.on('connect', () => {
      console.log('Connected to study rooms');
    });

    // Listen for room updates
    socketInstance.on('room-updated', (updatedRoom: StudyRoom) => {
      setRooms(prev => prev.map(room =>
        room.id === updatedRoom.id ? updatedRoom : room
      ));
      if (currentRoom?.id === updatedRoom.id) {
        setCurrentRoom(updatedRoom);
      }
    });

    // Listen for messages
    socketInstance.on('message-received', (data: { message: Message; roomId: string }) => {
      if (data.roomId === currentRoom?.id) {
        setMessages(prev => [...prev, data.message]);
      }
    });

    // Listen for user joined/left
    socketInstance.on('user-joined-room', (data: { user: RoomParticipant; roomId: string }) => {
      if (data.roomId === currentRoom?.id) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          userId: 'system',
          userName: 'System',
          content: `${data.user.name} joined the room`,
          timestamp: new Date(),
          type: 'system'
        }]);
      }
    });

    socketInstance.on('user-left-room', (data: { userId: string; roomId: string }) => {
      if (data.roomId === currentRoom?.id) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          userId: 'system',
          userName: 'System',
          content: `A participant left the room`,
          timestamp: new Date(),
          type: 'system'
        }]);
      }
    });

    setSocket(socketInstance);

    // Load available rooms
    loadRooms();

    return () => {
      socketInstance.disconnect();
    };
  }, [userId, userName, currentRoom?.id]);

  // Study timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStudyTimerActive) {
      interval = setInterval(() => {
        setStudyTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStudyTimerActive]);

  const sendMessage = () => {
    if (socket && currentRoom && newMessage.trim()) {
      socket.emit('send-room-message', {
        roomId: currentRoom.id,
        message: newMessage,
        userId,
        userName
      });
      setNewMessage('');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (currentRoom) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {currentRoom.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{currentRoom.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {currentRoom.currentParticipants}/{currentRoom.maxParticipants}
              </Badge>
              <Button variant="outline" size="sm" onClick={leaveRoom}>
                Zapusti
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col h-full">
          {/* Study Controls */}
          <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-mono">{formatTime(studyTime)}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsStudyTimerActive(!isStudyTimerActive)}
              >
                {isStudyTimerActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isStudyTimerActive ? 'Pavza' : 'Začni'}
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMusicPlaying(!isMusicPlaying)}
            >
              {isMusicPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              Glasba
            </Button>
          </div>

          {/* Participants */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Udeleženci</h4>
            <div className="flex flex-wrap gap-2">
              {currentRoom.participants.map((participant) => (
                <div key={participant.id} className="flex items-center gap-2 bg-muted/50 px-2 py-1 rounded">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {participant.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{participant.name}</span>
                  {participant.role === 'host' && <Crown className="h-3 w-3 text-yellow-500" />}
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col">
            <h4 className="font-semibold mb-2">Klepet</h4>
            <ScrollArea className="flex-1 border rounded p-2 mb-2 h-64">
              {messages.map((message) => (
                <div key={message.id} className="mb-2">
                  {message.type === 'system' ? (
                    <p className="text-xs text-muted-foreground italic">{message.content}</p>
                  ) : (
                    <div className="flex gap-2">
                      <span className="font-semibold text-sm">{message.userName}:</span>
                      <span className="text-sm">{message.content}</span>
                    </div>
                  )}
                </div>
              ))}
            </ScrollArea>
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Vpiši sporočilo..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button onClick={sendMessage}>
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Žive učilnice</h3>
        <Button onClick={() => createRoom(`Učilnica ${userName}`, 'Skupno učenje v realnem času', 'Splošno')}>
          <Plus className="h-4 w-4 mr-2" />
          Ustvari učilnico
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <Card key={room.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">{room.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{room.description}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">{room.subject}</Badge>
                <Badge variant={room.isActive ? 'default' : 'secondary'}>
                  {room.currentParticipants}/{room.maxParticipants}
                </Badge>
              </div>
              <Button
                className="w-full"
                disabled={room.currentParticipants >= room.maxParticipants}
                onClick={() => joinRoom(room.id)}
              >
                Pridruži se
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}