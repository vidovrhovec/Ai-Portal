'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCreateCourse } from '@/hooks';
import { BookOpen, AlertCircle } from 'lucide-react';

interface CreateCourseDialogProps {
  children: React.ReactNode;
}

export function CreateCourseDialog({ children }: CreateCourseDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const createCourse = useCreateCourse();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCourse.mutateAsync(formData);
      setFormData({ title: '', description: '' });
      setOpen(false);
    } catch {
      // Error is handled by the mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Ustvari nov tečaj</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Naslov tečaja</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Matematika 1. razred"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Opis tečaja</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Opis tečaja..."
              rows={3}
            />
          </div>

          {createCourse.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {createCourse.error.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Prekliči
            </Button>
            <Button type="submit" disabled={createCourse.isPending}>
              {createCourse.isPending ? 'Ustvarjanje...' : 'Ustvari tečaj'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}