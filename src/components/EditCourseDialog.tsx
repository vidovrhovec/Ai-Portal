'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUpdateCourse } from '@/hooks';
import { BookOpen, AlertCircle } from 'lucide-react';
import type { Course } from '@/types';

interface EditCourseDialogProps {
  children: React.ReactNode;
  course: Course | null;
}

export function EditCourseDialog({ children, course }: EditCourseDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const updateCourse = useUpdateCourse();

  // Initialize form data when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen && course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
      });
    } else if (!newOpen) {
      setFormData({ title: '', description: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;
    try {
      await updateCourse.mutateAsync({
        id: course.id,
        ...formData,
      });
      setOpen(false);
    } catch {
      // Error is handled by the mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Uredi tečaj</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Naslov tečaja</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Vnesite naslov tečaja"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Opis tečaja</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Vnesite opis tečaja"
              rows={3}
            />
          </div>
          {updateCourse.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Napaka pri posodabljanju tečaja. Poskusite znova.
              </AlertDescription>
            </Alert>
          )}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Prekliči
            </Button>
            <Button type="submit" disabled={updateCourse.isPending}>
              {updateCourse.isPending ? 'Posodabljanje...' : 'Posodobi'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}