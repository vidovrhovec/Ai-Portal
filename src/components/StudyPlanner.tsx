'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Calendar as CalendarIcon,
  Plus,
  Edit3,
  Trash2,
  Clock,
  CheckCircle,
  Circle,
  Target,
  Zap,
  Coffee
} from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday, addDays, startOfWeek, endOfWeek } from 'date-fns';

interface StudySession {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'cancelled';
  goals: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface StudyPlannerProps {
  className?: string;
}

const priorityColors = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-red-100 text-red-800 border-red-200'
};

const priorityIcons = {
  low: Coffee,
  medium: Target,
  high: Zap
};

export function StudyPlanner({ className = '' }: StudyPlannerProps) {
  const [sessions, setSessions] = useState<StudySession[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('study-sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((session: unknown) => {
          const s = session as Record<string, unknown>;
          return {
            ...s,
            date: new Date(s.date as string),
            createdAt: new Date(s.createdAt as string),
            updatedAt: new Date(s.updatedAt as string),
            status: s.status as 'pending' | 'completed' | 'cancelled'
          };
        });
      } catch (error) {
        console.error('Failed to parse study sessions:', error);
        return [];
      }
    }
    return [];
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const [newSession, setNewSession] = useState<{
    title: string;
    description: string;
    date: Date;
    startTime: string;
    endTime: string;
    subject: string;
    priority: 'low' | 'medium' | 'high';
    goals: string[];
  }>({
    title: '',
    description: '',
    date: new Date(),
    startTime: '',
    endTime: '',
    subject: '',
    priority: 'medium',
    goals: []
  });

  // Save sessions to localStorage
  const saveSessions = (updatedSessions: StudySession[]) => {
    localStorage.setItem('study-sessions', JSON.stringify(updatedSessions));
    setSessions(updatedSessions);
  };

  // Add new session
  const addSession = () => {
    const session: StudySession = {
      id: Date.now().toString(),
      title: newSession.title,
      description: newSession.description,
      date: newSession.date,
      startTime: newSession.startTime,
      endTime: newSession.endTime,
      subject: newSession.subject,
      priority: newSession.priority,
      status: 'pending',
      goals: newSession.goals,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedSessions = [...sessions, session].sort((a, b) => a.date.getTime() - b.date.getTime());
    saveSessions(updatedSessions);

    setNewSession({
      title: '',
      description: '',
      date: new Date(),
      startTime: '',
      endTime: '',
      subject: '',
      priority: 'medium',
      goals: []
    });
    setShowAddDialog(false);
  };

  // Update session
  const updateSession = () => {
    if (!editingSession) return;

    const updatedSessions = sessions.map(session =>
      session.id === editingSession.id
        ? { ...editingSession, updatedAt: new Date() }
        : session
    );
    saveSessions(updatedSessions);
    setEditingSession(null);
  };

  // Delete session
  const deleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter(session => session.id !== sessionId);
    saveSessions(updatedSessions);
  };

  // Toggle session status
  const toggleSessionStatus = (sessionId: string) => {
    const updatedSessions = sessions.map(session =>
      session.id === sessionId
        ? {
            ...session,
            status: (session.status === 'completed' ? 'pending' : 'completed') as 'pending' | 'completed' | 'cancelled',
            updatedAt: new Date()
          }
        : session
    );
    saveSessions(updatedSessions);
  };

  // Get sessions for selected date
  const getSessionsForDate = (date: Date) => {
    return sessions.filter(session =>
      session.date.toDateString() === date.toDateString()
    );
  };

  // Get filtered sessions
  const getFilteredSessions = () => {
    let filtered = sessions;

    if (filter !== 'all') {
      filtered = filtered.filter(session => session.status === filter);
    }

    return filtered.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  // Get upcoming sessions (next 7 days)
  const getUpcomingSessions = () => {
    const today = new Date();
    const nextWeek = addDays(today, 7);

    return sessions
      .filter(session =>
        session.date >= today &&
        session.date <= nextWeek &&
        session.status === 'pending'
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  };

  // Format date for display
  const formatDateDisplay = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d, yyyy');
  };

  const upcomingSessions = getUpcomingSessions();
  const filteredSessions = getFilteredSessions();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Study Planner</h2>
        </div>
        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={(value: 'calendar' | 'list') => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="calendar">Calendar</SelectItem>
              <SelectItem value="list">List</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filter} onValueChange={(value: 'all' | 'pending' | 'completed') => setFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sessions</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Session
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule Study Session</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Session title"
                  value={newSession.title}
                  onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={newSession.description}
                  onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                  rows={2}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="time"
                    value={newSession.startTime}
                    onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
                  />
                  <Input
                    type="time"
                    value={newSession.endTime}
                    onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })}
                  />
                </div>
                <Input
                  placeholder="Subject"
                  value={newSession.subject}
                  onChange={(e) => setNewSession({ ...newSession, subject: e.target.value })}
                />
                <Select
                  value={newSession.priority}
                  onValueChange={(value) =>
                    setNewSession({ ...newSession, priority: value as 'low' | 'medium' | 'high' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addSession} disabled={!newSession.title.trim()}>
                    Schedule
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingSessions.map((session) => {
                const PriorityIcon = priorityIcons[session.priority];
                return (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleSessionStatus(session.id)}
                      >
                        {session.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </Button>
                      <div>
                        <h4 className="font-medium">{session.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-3 w-3" />
                          {formatDateDisplay(session.date)} {session.startTime}
                          <Badge className={`text-xs ${priorityColors[session.priority]}`}>
                            <PriorityIcon className="h-3 w-3 mr-1" />
                            {session.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar/List View */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {viewMode === 'calendar' ? 'Calendar View' : 'Session List'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {viewMode === 'calendar' ? (
                <div className="space-y-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                  />

                  {/* Sessions for selected date */}
                  <div className="space-y-2">
                    <h4 className="font-medium">
                      Sessions for {formatDateDisplay(selectedDate)}
                    </h4>
                    {getSessionsForDate(selectedDate).map((session) => {
                      const PriorityIcon = priorityIcons[session.priority];
                      return (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleSessionStatus(session.id)}
                            >
                              {session.status === 'completed' ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <Circle className="h-5 w-5 text-gray-400" />
                              )}
                            </Button>
                            <div>
                              <h5 className="font-medium">{session.title}</h5>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="h-3 w-3" />
                                {session.startTime} - {session.endTime}
                                <Badge className={`text-xs ${priorityColors[session.priority]}`}>
                                  <PriorityIcon className="h-3 w-3 mr-1" />
                                  {session.priority}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingSession(session)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteSession(session.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {filteredSessions.map((session) => {
                      const PriorityIcon = priorityIcons[session.priority];
                      return (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleSessionStatus(session.id)}
                                className="mt-1"
                              >
                                {session.status === 'completed' ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <Circle className="h-5 w-5 text-gray-400" />
                                )}
                              </Button>
                              <div className="flex-1">
                                <h4 className="font-medium">{session.title}</h4>
                                <p className="text-sm text-gray-600 mb-2">{session.description}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <CalendarIcon className="h-3 w-3" />
                                    {formatDateDisplay(session.date)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {session.startTime} - {session.endTime}
                                  </span>
                                  <Badge className={`text-xs ${priorityColors[session.priority]}`}>
                                    <PriorityIcon className="h-3 w-3 mr-1" />
                                    {session.priority}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingSession(session)}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteSession(session.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {filteredSessions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-sm">No study sessions found</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Schedule your first study session to get started
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Statistics Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Study Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {sessions.filter(s => s.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {sessions.filter(s => s.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-medium text-sm">This Week</h5>
                <div className="text-sm text-gray-600">
                  {sessions.filter(s =>
                    s.date >= startOfWeek(new Date()) &&
                    s.date <= endOfWeek(new Date()) &&
                    s.status === 'completed'
                  ).length} sessions completed
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Session Dialog */}
      {editingSession && (
        <Dialog open={!!editingSession} onOpenChange={() => setEditingSession(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Study Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Session title"
                value={editingSession.title}
                onChange={(e) => setEditingSession({ ...editingSession, title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={editingSession.description}
                onChange={(e) => setEditingSession({ ...editingSession, description: e.target.value })}
                rows={2}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="time"
                  value={editingSession.startTime}
                  onChange={(e) => setEditingSession({ ...editingSession, startTime: e.target.value })}
                />
                <Input
                  type="time"
                  value={editingSession.endTime}
                  onChange={(e) => setEditingSession({ ...editingSession, endTime: e.target.value })}
                />
              </div>
              <Select
                value={editingSession.priority}
                onValueChange={(value) =>
                  setEditingSession({ ...editingSession, priority: value as 'low' | 'medium' | 'high' })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingSession(null)}>
                  Cancel
                </Button>
                <Button onClick={updateSession}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}