'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Edit3,
  Trash2,
  Plus,
  Clock,
  StickyNote,
  Brain
} from 'lucide-react';
import { format } from 'date-fns';

interface VideoNote {
  id: string;
  timestamp: number; // in seconds
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

interface RawVideoNote {
  id: string;
  timestamp: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

interface VideoNotesProps {
  videoId?: string;
  videoUrl?: string;
  videoTitle?: string;
  onTimeUpdate?: (time: number) => void;
  className?: string;
}

export function VideoNotes({
  videoId = '',
  videoUrl = '',
  videoTitle = 'Video Notes',
  onTimeUpdate,
  className = ''
}: VideoNotesProps) {
  const [notes, setNotes] = useState<VideoNote[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<VideoNote | null>(null);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    tags: [] as string[]
  });
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [noteIdCounter, setNoteIdCounter] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load notes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`video-notes-${videoId}`);
    if (saved) {
      try {
        const parsed: RawVideoNote[] = JSON.parse(saved);
        const notesWithDates = parsed.map((note: RawVideoNote) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        }));
         
        setNotes(notesWithDates);
      } catch (error) {
        console.error('Failed to parse video notes:', error);
      }
    }
  }, [videoId]);

  // Save notes to localStorage
  const saveNotes = useCallback((updatedNotes: VideoNote[]) => {
    localStorage.setItem(`video-notes-${videoId}`, JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  }, [videoId]);

  // Video event handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      onTimeUpdate?.(time);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        containerRef.current.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  // Utility functions
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Note management
  const addNote = useCallback(() => {
    const newId = noteIdCounter + 1;
    const note: VideoNote = {
      id: newId.toString(),
      timestamp: currentTime,
      title: newNote.title || `Note at ${formatTime(currentTime)}`,
      content: newNote.content,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: newNote.tags
    };

    const updatedNotes = [...notes, note].sort((a, b) => a.timestamp - b.timestamp);
    saveNotes(updatedNotes);

    setNewNote({ title: '', content: '', tags: [] });
    setShowNoteDialog(false);
    setNoteIdCounter(newId);
  }, [noteIdCounter, notes, currentTime, newNote, saveNotes]);

  const updateNote = () => {
    if (!editingNote) return;

    const updatedNotes = notes.map(note =>
      note.id === editingNote.id
        ? { ...editingNote, updatedAt: new Date() }
        : note
    );
    saveNotes(updatedNotes);
    setEditingNote(null);
  };

  const deleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    saveNotes(updatedNotes);
  };

  const generateAISummary = async () => {
    if (notes.length === 0) return;

    setIsGeneratingSummary(true);
    try {
      const notesText = notes.map(note =>
        `[${formatTime(note.timestamp)}] ${note.title}: ${note.content}`
      ).join('\n');

      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `Please provide a comprehensive summary of these video notes, organized by timestamps and key topics discussed:\n\n${notesText}`,
          context: 'video_notes_summary'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiSummary(data.response);
      } else {
        setAiSummary('Failed to generate summary. Please try again.');
      }
    } catch (error) {
      console.error('Error generating AI summary:', error);
      setAiSummary('Error generating summary. Please check your connection.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Video Player */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            {videoTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={containerRef} className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={videoUrl || undefined}
              className="w-full h-auto"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={handlePlay}
              onPause={handlePause}
            />

            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-600 rounded-full h-1">
                  <div
                    className="bg-blue-600 h-1 rounded-full transition-all duration-100"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-white mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatDuration(duration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => skip(-10)}
                    className="text-white hover:bg-white/20"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>

                  <Button
                    size="sm"
                    onClick={togglePlay}
                    className="text-white bg-white/20 hover:bg-white/30"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => skip(10)}
                    className="text-white hover:bg-white/20"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-20"
                  />

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/20"
                  >
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5" />
              Video Notes ({notes.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={generateAISummary}
                disabled={notes.length === 0 || isGeneratingSummary}
                className="gap-2"
              >
                <Brain className="h-4 w-4" />
                {isGeneratingSummary ? 'Generating...' : 'AI Summary'}
              </Button>
              <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Note
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Note at {formatTime(currentTime)}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Note title (optional)"
                      value={newNote.title}
                      onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    />
                    <Textarea
                      placeholder="Write your note here..."
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                      rows={4}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={addNote} disabled={!newNote.content.trim()}>
                        Add Note
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              <AnimatePresence>
                {notes.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => seekTo(note.timestamp)}
                              className="gap-1"
                            >
                              <Clock className="h-3 w-3" />
                              {formatTime(note.timestamp)}
                            </Button>
                            <h4 className="font-medium">{note.title}</h4>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingNote(note)}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteNote(note.id)}
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-2">{note.content}</p>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{format(note.createdAt, 'MMM d, yyyy HH:mm')}</span>
                          {note.tags.length > 0 && (
                            <div className="flex gap-1">
                              {note.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {notes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <StickyNote className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">No notes yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Click &quot;Add Note&quot; to create your first video note
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* AI Summary Section */}
      {aiSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Generated Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {aiSummary}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Note Dialog */}
      {editingNote && (
        <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Note title"
                value={editingNote.title}
                onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
              />
              <Textarea
                placeholder="Note content"
                value={editingNote.content}
                onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingNote(null)}>
                  Cancel
                </Button>
                <Button onClick={updateNote}>
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