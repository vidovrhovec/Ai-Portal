'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCreateStudent } from '@/hooks/useStudents';
import { UserPlus, AlertCircle } from 'lucide-react';

interface CreateStudentDialogProps {
  children: React.ReactNode;
}

export function CreateStudentDialog({ children }: CreateStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
  });

  const createStudent = useCreateStudent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStudent.mutateAsync(formData);
      setFormData({ email: '', name: '', password: '' });
      setOpen(false);
    } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
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
            <UserPlus className="h-5 w-5" />
            <span>Dodaj učenca</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="ucenec@email.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Ime in priimek</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Janez Novak"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Geslo</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Vnesite geslo"
              required
            />
          </div>

          {createStudent.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {createStudent.error.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Prekliči
            </Button>
            <Button type="submit" disabled={createStudent.isPending}>
              {createStudent.isPending ? 'Dodajanje...' : 'Dodaj učenca'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}