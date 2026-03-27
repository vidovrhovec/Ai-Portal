import { User } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCreateGroup } from '@/hooks/useGroups';
import { useStudents } from '@/hooks/useStudents';
import { Users, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface CreateGroupDialogProps {
  children: React.ReactNode;
}

export function CreateGroupDialog({ children }: CreateGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const createGroup = useCreateGroup();
  const { data: students } = useStudents();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createGroup.mutateAsync({
        ...formData,
        memberIds: selectedStudents,
      });
      setFormData({ name: '', description: '' });
      setSelectedStudents([]);
      setOpen(false);
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleStudentToggle = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Ustvari novo skupino</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ime skupine</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Matematika skupina A"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Opis skupine</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Opis skupine..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Dodaj učence v skupino</Label>
            <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
              {students?.map((student: User) => (
                <div key={student.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`student-${student.id}`}
                    checked={selectedStudents.includes(student.id)}
                    onCheckedChange={(checked) => handleStudentToggle(student.id, checked as boolean)}
                  />
                  <Label htmlFor={`student-${student.id}`} className="text-sm">
                    {student.name || student.email}
                  </Label>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground">Ni učencev na voljo</p>
              )}
            </div>
          </div>

          {createGroup.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {createGroup.error.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Prekliči
            </Button>
            <Button type="submit" disabled={createGroup.isPending}>
              {createGroup.isPending ? 'Ustvarjanje...' : 'Ustvari skupino'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}