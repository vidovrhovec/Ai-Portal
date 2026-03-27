import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuizzes } from '@/hooks';
import { useAssignQuizToGroup } from '@/hooks/useGroups';

interface AssignTaskDialogProps {
  groupId: string;
  children: React.ReactNode;
}

export function AssignTaskDialog({ groupId, children }: AssignTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: quizzes } = useQuizzes();
  const assign = useAssignQuizToGroup();
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [courseId, setCourseId] = useState('');

  const handleAssign = async () => {
    try {
      if (selectedQuiz) {
        await assign.mutateAsync({ groupId, quizId: selectedQuiz });
      } else {
        if (!newTitle || !courseId) {
          alert('Prosimo, vnesite naslov in izberite tečaj za novo nalogo');
          return;
        }
        await assign.mutateAsync({ groupId, title: newTitle, courseId });
      }
      setOpen(false);
    } catch (err) {
      // handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Dodeli nalogo skupini</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Izberi obstoječ kviz</Label>
            <Select onValueChange={(v) => setSelectedQuiz(v)}>
              <SelectTrigger>
                <SelectValue>{selectedQuiz || 'Izberi kviz'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {quizzes?.map((q: any) => (
                  <SelectItem key={q.id} value={q.id}>{q.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-2">Ali ustvarite novo nalogo</div>
            <Label>Naslov nove naloge</Label>
            <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Naslov naloge" />
            <Label className="mt-2">Tečaj (ID)</Label>
            <Input value={courseId} onChange={(e) => setCourseId(e.target.value)} placeholder="ID tečaja" />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Prekliči</Button>
            <Button onClick={handleAssign}>{assign.isPending ? 'Dodeljevanje...' : 'Dodeli'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
