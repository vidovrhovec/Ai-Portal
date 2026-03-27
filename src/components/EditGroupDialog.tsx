import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUpdateGroup } from '@/hooks/useGroups';
import { useStudents } from '@/hooks/useStudents';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle } from 'lucide-react';

interface EditGroupDialogProps {
  group: any;
  children: React.ReactNode;
}

export function EditGroupDialog({ group, children }: EditGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [selected, setSelected] = useState<string[]>([]);
  const updateGroup = useUpdateGroup();
  const { data: students } = useStudents();

  useEffect(() => {
    if (group) {
      setForm({ name: group.name || '', description: group.description || '' });
      setSelected((group.members || []).map((m: any) => m.studentId));
    }
  }, [group]);

  const toggleStudent = (id: string, checked: boolean) => {
    if (checked) setSelected(prev => [...prev, id]);
    else setSelected(prev => prev.filter(x => x !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateGroup.mutateAsync({ groupId: group.id, name: form.name, description: form.description, memberIds: selected });
      setOpen(false);
    } catch (err) {
      // handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Uredi skupino</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Ime</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} required />
          </div>
          <div>
            <Label htmlFor="description">Opis</Label>
            <Textarea id="description" value={form.description} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} />
          </div>

          <div>
            <Label>Člani</Label>
            <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
              {students?.map((s: any) => (
                <div key={s.id} className="flex items-center space-x-2">
                  <Checkbox id={`student-${s.id}`} checked={selected.includes(s.id)} onCheckedChange={(c) => toggleStudent(s.id, c as boolean)} />
                  <label htmlFor={`student-${s.id}`} className="text-sm">{s.name || s.email}</label>
                </div>
              ))}
            </div>
          </div>

          {updateGroup.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{updateGroup.error.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Prekliči</Button>
            <Button type="submit" disabled={updateGroup.isPending}>{updateGroup.isPending ? 'Shranjevanje...' : 'Shrani'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
