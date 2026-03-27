import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Plus, BookOpen, FileText, Clock, Target } from 'lucide-react';
import CurriculumHeatmap from '@/components/CurriculumHeatmap';
import { useCurriculum } from '@/hooks';
import { useCreateMaterial } from '@/hooks/useMaterials';
import { AnimatedToast } from '@/components/MicroInteractions';
import { useCourses } from '@/hooks';
import { useCreateQuiz } from '@/hooks/useQuizzes';
import { useState as useLocalState } from 'react';
import { getCSRFToken } from '@/lib/utils';

const FALLBACK_SUBJECTS = [
  { code: 'mathematics', name: 'Mathematics' },
  { code: 'science', name: 'Science' },
  { code: 'english', name: 'English' },
  { code: 'history', name: 'History' },
  { code: 'geography', name: 'Geography' },
  { code: 'biology', name: 'Biology' },
  { code: 'chemistry', name: 'Chemistry' },
  { code: 'physics', name: 'Physics' },
  { code: 'computer-science', name: 'Computer Science' },
  { code: 'art', name: 'Art' },
  { code: 'music', name: 'Music' },
  { code: 'physical-education', name: 'Physical Education' },
  { code: 'civics', name: 'Civics' },
  { code: 'economics', name: 'Economics' },
  { code: 'foreign-languages', name: 'Foreign Languages' },
];

type CurriculumPlannerSectionProps = Record<string, never>;

interface Course {
  id: string;
  title: string;
}

interface CurriculumUnit {
  id: string;
  title?: string;
  name?: string;
  status?: string;
  difficulty?: string;
  createdAt?: string;
  resources?: unknown[];
  materials?: number;
  quizzes?: number;
  learningObjectives?: string;
  startDate?: string;
  endDate?: string;
}

interface BulkImportItem {
  title?: string;
  type?: string;
  content?: string;
  url?: string;
  courseId?: string;
  [key: string]: unknown;
}

interface QuizQuestion {
  question?: string;
  prompt?: string;
  options?: unknown[];
  correctAnswer?: number;
}

interface QuizData {
  title?: string;
  questions?: QuizQuestion[];
}

interface Subject {
  code?: string;
  name?: string;
}

interface AddUnitFormProps {
  subjects: Subject[];
  onCreate: (data: {
    subjectCode: string;
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
  }) => Promise<void> | void;
}

function AddUnitForm({ subjects, onCreate }: AddUnitFormProps) {
  const [title, setTitle] = useState('');
  const [subjectCode, setSubjectCode] = useState<string>('');
  React.useEffect(() => {
    if ((!subjectCode || subjectCode === '') && subjects && subjects.length > 0) {
      setSubjectCode(subjects[0].code ?? '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="unit-title">Unit Title</Label>
        <Input id="unit-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Algebra Fundamentals" />
      </div>
      <div>
        <Label htmlFor="subject">Subject</Label>
        <Select value={subjectCode} onValueChange={(v) => setSubjectCode(v || '')}>
          <SelectTrigger>
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.filter(s => s.code).map((s) => (
              <SelectItem key={s.code!} value={s.code!}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start-date">Start Date</Label>
          <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="end-date">End Date</Label>
          <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>
      <div>
        <Label htmlFor="desc">Description</Label>
        <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
      </div>
      <Button className="w-full" onClick={async () => {
        if (!title || !subjectCode) return window.alert('Please provide title and subject');
        setLoading(true);
        try {
          await onCreate({ subjectCode, name: title, description, startDate: startDate || undefined, endDate: endDate || undefined });
          setTitle(''); setDescription(''); setStartDate(''); setEndDate('');
        } catch {
          // noop
        } finally {
          setLoading(false);
        }
      }} disabled={loading}>{loading ? 'Creating...' : 'Create Unit'}</Button>
    </div>
  );
}

function CreateQuizButton({ unit }: { unit: CurriculumUnit }) {
  const [open, setOpen] = useState(false);
  const { data: courses } = useCourses();
  const createQuiz = useCreateQuiz();
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [title, setTitle] = useState(`${unit.title} - Quiz`);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: 'success'|'error'|'info' } | null>(null);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="h-12 sm:h-10 touch-manipulation text-sm font-medium">
            <FileText className="mr-2 h-4 w-4" />
            Create Quiz
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Create Quiz for Unit</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">Choose course and title then create quiz (questions can be added later).</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Course</Label>
              <Select value={selectedCourse} onValueChange={(v) => setSelectedCourse(v || '')}>
                <SelectTrigger className="h-12 sm:h-10">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {(courses || []).map((c: Course) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12 sm:h-10"
                placeholder="Quiz title"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 pt-2">
              <Button
                onClick={async () => {
                  if (!selectedCourse) return setToast({ message: 'Please select a course', type: 'error' });
                  setLoading(true);
                  try {
                    await createQuiz.mutateAsync({ title, questions: [], courseId: selectedCourse });
                    setToast({ message: 'Quiz created', type: 'success' });
                    setOpen(false);
                  } catch {
                    setToast({ message: 'Failed to create quiz', type: 'error' });
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="h-12 sm:h-10 touch-manipulation flex-1"
              >
                {loading ? 'Creating...' : 'Create'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setOpen(false)}
                className="h-12 sm:h-10 touch-manipulation"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {toast && <AnimatedToast message={toast.message} type={toast.type === 'error' ? 'error' : 'success'} onClose={() => setToast(null)} />}
    </>
  );
}

function BulkImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'info' } | null>(null);

  async function handleFile(file?: File, pasted?: string) {
    setLoading(true);
    try {
      let text = '';
      if (file) {
        text = await file.text();
      } else if (pasted) {
        text = pasted;
      }

      let items: BulkImportItem[] = [];
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) items = parsed;
        else throw new Error('JSON must be an array of materials');
      } catch {
        // Try CSV fallback (simple parser)
        const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        if (lines.length >= 2) {
          const headers = lines[0].split(',').map(h => h.trim());
          items = lines.slice(1).map((ln) => {
            const cols = ln.split(',').map(c => c.trim());
            const obj: BulkImportItem = {};
            headers.forEach((h, i) => { obj[h] = cols[i] ?? ''; });
            return obj;
          });
        } else {
          throw new Error('Invalid file format. Expected JSON array or CSV with headers.');
        }
      }

      if (!items.length) throw new Error('No items parsed');

      const csrf = await getCSRFToken();
      const res = await fetch('/api/materials/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf },
        credentials: 'include',
        body: JSON.stringify(items),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Upload failed');
      }

      setToast({ message: `Imported ${items.length} materials`, type: 'success' });
      onOpenChange(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Import failed';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Import Materials</DialogTitle>
            <DialogDescription>Upload a JSON array or CSV file with materials (columns: title,type,content,url,courseId).</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <input
                id="bulk-file"
                type="file"
                accept="application/json,text/csv,text/plain"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </div>
            <div>
              <Label>Or paste JSON/CSV</Label>
              <textarea id="bulk-paste" className="w-full h-40 p-2 border rounded" placeholder='[{{"title":"...","type":"text","content":"..."}}]'></textarea>
              <div className="flex space-x-2 mt-2">
                <Button
                  onClick={async () => {
                    const area = document.getElementById('bulk-paste') as HTMLTextAreaElement | null;
                    if (!area) return;
                    await handleFile(undefined, area.value);
                  }}
                  disabled={loading}
                >
                  {loading ? 'Importing...' : 'Import Pasted'}
                </Button>
                <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {toast && <AnimatedToast message={toast.message} type={toast.type === 'error' ? 'error' : 'success'} onClose={() => setToast(null)} />}
    </>
  );
}

function GenerateQuizDialog({ open, onOpenChange, defaultTopic }: { open: boolean; onOpenChange: (v: boolean) => void; defaultTopic?: string }) {
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState(defaultTopic || '');
  const [difficulty, setDifficulty] = useState<'easy'|'medium'|'hard'>('medium');
  const { data: courses } = useCourses();
  const createQuiz = useCreateQuiz();
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type?: 'success'|'error'|'info' } | null>(null);

  React.useEffect(() => {
    if (defaultTopic) setTopic(defaultTopic);
  }, [defaultTopic]);

  async function handleGenerate() {
    if (!topic) return setToast({ message: 'Please provide a topic', type: 'error' });
    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type: 'quiz', topic, difficulty }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Generation failed');
      }

      const data = await res.json();
      setResult(data.content || JSON.stringify(data));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Generation failed';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateQuizFromResult() {
    try {
      let parsed: QuizData | null = null;
      try {
        parsed = JSON.parse(result) as QuizData;
      } catch {
        // not JSON
        return setToast({ message: 'Generated content is not valid JSON. Edit it to a JSON quiz format before creating.', type: 'error' });
      }

      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        return setToast({ message: 'JSON must include a "questions" array.', type: 'error' });
      }

      if (!selectedCourse) return setToast({ message: 'Select a course to attach the quiz to.', type: 'error' });

      const questions = parsed.questions.map((q: QuizQuestion) => ({
        question: q.question || q.prompt || '',
        options: (q.options || []) as string[],
        correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
      }));

      await createQuiz.mutateAsync({ title: parsed.title || `Generated: ${topic}`, questions, courseId: selectedCourse });
      setToast({ message: 'Quiz created', type: 'success' });
      onOpenChange(false);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to create quiz';
      setToast({ message: errorMessage, type: 'error' });
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Quiz Bank</DialogTitle>
            <DialogDescription>Generate a quiz using AI from a topic or course materials. You can preview and save the generated quiz.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Topic</Label>
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Photosynthesis" />
            </div>
            <div>
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty((v as 'easy' | 'medium' | 'hard') || 'medium')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Course (optional, required to save)</Label>
              <Select value={selectedCourse} onValueChange={(v) => setSelectedCourse(v || '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {(courses || []).map((c: Course) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleGenerate} disabled={loading}>{loading ? 'Generating...' : 'Generate'}</Button>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
            </div>

            {result ? (
              <div>
                <Label>Preview / Edit Generated Content (JSON expected)</Label>
                <textarea className="w-full h-56 p-2 border rounded" value={result} onChange={(e) => setResult(e.target.value)} />
                <div className="flex space-x-2 mt-2">
                  <Button onClick={handleCreateQuizFromResult}>Create Quiz from JSON</Button>
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
      {toast && <AnimatedToast message={toast.message} type={toast.type === 'error' ? 'error' : 'success'} onClose={() => setToast(null)} />}
    </>
  );
}

interface UpdateTopicMutation {
  mutateAsync: (data: { id: string; startDate?: string; endDate?: string; learningObjectives?: string }) => Promise<unknown>;
}

function AdjustTimelineDialog({ open, onOpenChange, units, updateTopic }: { open: boolean; onOpenChange: (v: boolean) => void; units: CurriculumUnit[]; updateTopic: UpdateTopicMutation }) {
  const [items, setItems] = useState<Array<{ id: string; title: string; startDate: string; endDate: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: 'success'|'error' } | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const mapped = (units || []).map((u: CurriculumUnit) => ({
      id: u.id,
      title: u.name || u.title || 'Untitled',
      startDate: u.startDate ? new Date(u.startDate).toISOString().slice(0,10) : '',
      endDate: u.endDate ? new Date(u.endDate).toISOString().slice(0,10) : '',
    }));
    setItems(mapped);
  }, [open, units]);

  async function handleSave() {
    setLoading(true);
    try {
      const promises = items.map((it) => updateTopic.mutateAsync({ id: it.id, startDate: it.startDate || undefined, endDate: it.endDate || undefined }));
      await Promise.all(promises);
      setToast({ message: `Saved ${items.length} timeline updates`, type: 'success' });
      onOpenChange(false);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to save timeline';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Timeline</DialogTitle>
            <DialogDescription>Quickly edit start and end dates for your curriculum units.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="text-sm text-muted-foreground">No units available to edit.</div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-auto">
                {items.map((it) => (
                  <div key={it.id} className="border p-2 rounded flex items-center space-x-3">
                    <div className="flex-1">
                      <div className="font-medium">{it.title}</div>
                      <div className="text-xs text-muted-foreground">ID: {it.id}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div>
                        <Label className="text-xs">Start</Label>
                        <Input type="date" value={it.startDate} onChange={(e) => setItems((prev) => prev.map(p => p.id === it.id ? { ...p, startDate: e.target.value } : p))} />
                      </div>
                      <div>
                        <Label className="text-xs">End</Label>
                        <Input type="date" value={it.endDate} onChange={(e) => setItems((prev) => prev.map(p => p.id === it.id ? { ...p, endDate: e.target.value } : p))} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={loading || items.length === 0}>{loading ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {toast && <AnimatedToast message={toast.message} type={toast.type === 'error' ? 'error' : 'success'} onClose={() => setToast(null)} />}
    </>
  );
}

export const CurriculumPlannerSection: React.FC<CurriculumPlannerSectionProps> = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [addOpen, setAddOpen] = useLocalState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [objectivesOpen, setObjectivesOpen] = useState(false);
  const [objectivesTarget, setObjectivesTarget] = useState<string | null>(null);
  const [toast, setToast] = useLocalState<{ message: string; type?: 'success'|'error'|'info'|'warning' } | null>(null);

  const { data: subjectsData } = useCurriculum().useSubjects();
  const { data: topicsData } = useCurriculum().useTopics(selectedSubject || undefined);
  const createTopic = useCurriculum().useCreateTopic();
  const createMaterial = useCreateMaterial();
  const updateTopic = useCurriculum().useUpdateTopic();

  // Use fetched subjects if available; otherwise fall back to a canonical subject list
  const subjects = (subjectsData && subjectsData.length > 0) ? subjectsData : FALLBACK_SUBJECTS;
  const curriculumUnits = topicsData || [];

  const filteredUnits = selectedSubject ? curriculumUnits : curriculumUnits;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold">Curriculum Planner</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Visual yearly planning tool linking materials, quizzes, and deadlines</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto h-12 sm:h-10 touch-manipulation">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add Unit</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Curriculum Unit</DialogTitle>
              <DialogDescription>
                Create a new unit in your curriculum plan
              </DialogDescription>
            </DialogHeader>
            <AddUnitForm subjects={subjects} onCreate={async (payload) => {
              try {
                await createTopic.mutateAsync(payload);
                setToast({ message: 'Unit created', type: 'success' });
                setAddOpen(false);
              } catch {
                setToast({ message: 'Failed to create unit', type: 'error' });
              }
            }} />
          </DialogContent>
        </Dialog>
        {toast && (
          <AnimatedToast message={toast.message} type={toast.type || 'info'} onClose={() => setToast(null)} />
        )}
      </div>

      {/* Subject Filter */}
      <Card className="touch-manipulation">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Select Subject</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Select value={selectedSubject} onValueChange={(v) => setSelectedSubject(v || '')}>
            <SelectTrigger className="w-full h-12 sm:h-10 touch-manipulation">
              <SelectValue placeholder="Choose a subject to filter curriculum units" />
            </SelectTrigger>
            <SelectContent>
              {subjects.filter((subject: Subject) => subject.code).map((subject: Subject) => (
                <SelectItem key={subject.code!} value={subject.code!} className="touch-manipulation">
                  <div className="flex items-center py-1">
                    <div className={`w-3 h-3 rounded-full mr-3 bg-gradient-to-r from-blue-500 to-purple-500 shrink-0`}></div>
                    <span className="text-sm sm:text-base">{subject.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Curriculum Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Curriculum Timeline
          </CardTitle>
          <CardDescription>
            Visual overview of your curriculum units and their progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUnits.map((unit: CurriculumUnit) => (
              <div key={unit.id} className="border rounded-lg p-4 sm:p-6 touch-manipulation">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-2">{unit.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="mr-1.5 h-4 w-4 shrink-0" />
                        <span className="text-sm">
                          {unit.createdAt ? new Date(unit.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="mr-1.5 h-4 w-4 shrink-0" />
                        <span className="text-sm">
                          {unit.resources ? unit.resources.length : 0} materials
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="mr-1.5 h-4 w-4 shrink-0" />
                        <span className="text-sm">{0} quizzes</span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={unit.status === 'completed' ? 'default' : 'outline'}
                    className="self-start sm:self-auto text-sm px-3 py-1"
                  >
                    {unit.difficulty || 'n/a'}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-12 sm:h-10 touch-manipulation text-sm font-medium"
                    onClick={async () => {
                      try {
                        await createMaterial.mutateAsync({ title: `${unit.name || unit.title} — Resource`, type: 'text', content: 'Auto-created resource for unit', });
                      } catch {
                        // ignore
                      }
                    }}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Add Material
                  </Button>
                  <CreateQuizButton unit={unit} />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-12 sm:h-10 touch-manipulation text-sm font-medium"
                    onClick={() => {
                      setObjectivesTarget(unit.id);
                      setObjectivesOpen(true);
                    }}
                  >
                    <Target className="mr-2 h-4 w-4" />
                    Set Goals
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Heatmap */}
      <div className="mt-4">
        <CurriculumHeatmap />
      </div>

      {/* Curriculum Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="touch-manipulation hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg sm:text-xl font-semibold">Total Units</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">{filteredUnits.length}</div>
            <p className="text-sm text-muted-foreground">Across all subjects</p>
          </CardContent>
        </Card>
        <Card className="touch-manipulation hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg sm:text-xl font-semibold">Materials Created</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">
              {filteredUnits.reduce((sum: number, unit: CurriculumUnit) => sum + (unit.materials || 0), 0)}
            </div>
            <p className="text-sm text-muted-foreground">Learning resources</p>
          </CardContent>
        </Card>
        <Card className="touch-manipulation hover:shadow-lg transition-all duration-200 hover:scale-[1.02] sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg sm:text-xl font-semibold">Quizzes Planned</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl sm:text-4xl font-bold text-orange-600 mb-2">
              {filteredUnits.reduce((sum: number, unit: CurriculumUnit) => sum + (unit.quizzes || 0), 0)}
            </div>
            <p className="text-sm text-muted-foreground">Assessment tools</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="touch-manipulation">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Common curriculum planning tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Button
              variant="outline"
              className="h-16 sm:h-20 flex-col p-3 sm:p-4 touch-manipulation hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => setBulkOpen(true)}
            >
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2 text-blue-600" />
              <span className="text-xs sm:text-sm text-center leading-tight font-medium">Bulk Import Materials</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 sm:h-20 flex-col p-3 sm:p-4 touch-manipulation hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => setGenerateOpen(true)}
            >
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2 text-green-600" />
              <span className="text-xs sm:text-sm text-center leading-tight font-medium">Generate Quiz Bank</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 sm:h-20 flex-col p-3 sm:p-4 touch-manipulation hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => setAdjustOpen(true)}
            >
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2 text-orange-600" />
              <span className="text-xs sm:text-sm text-center leading-tight font-medium">Adjust Timeline</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 sm:h-20 flex-col p-3 sm:p-4 touch-manipulation hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => { setObjectivesTarget(null); setObjectivesOpen(true); }}
            >
              <Target className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2 text-purple-600" />
              <span className="text-xs sm:text-sm text-center leading-tight font-medium">Set Learning Objectives</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      <AdjustTimelineDialog open={adjustOpen} onOpenChange={setAdjustOpen} units={curriculumUnits} updateTopic={updateTopic} />
      <SetObjectivesDialog open={objectivesOpen} onOpenChange={(v) => { if (!v) setObjectivesTarget(null); setObjectivesOpen(v); }} units={curriculumUnits} updateTopic={updateTopic} targetId={objectivesTarget} />
      <BulkImportDialog open={bulkOpen} onOpenChange={setBulkOpen} />
      <GenerateQuizDialog open={generateOpen} onOpenChange={setGenerateOpen} defaultTopic={subjects && subjects[0]?.name} />
    </div>
  );
};

function SetObjectivesDialog({ open, onOpenChange, units, updateTopic, targetId }: { open: boolean; onOpenChange: (v: boolean) => void; units: CurriculumUnit[]; updateTopic: UpdateTopicMutation; targetId?: string | null }) {
  const [selected, setSelected] = useState<string | null>(targetId || null);
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: 'success'|'error' } | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const id = targetId || (units && units[0] && units[0].id) || null;
    setSelected(id);
    const found = (units || []).find((u: CurriculumUnit) => u.id === id);
    setText(found?.learningObjectives || '');
  }, [open, targetId, units]);

  async function handleSave() {
    if (!selected) return setToast({ message: 'Select a unit', type: 'error' });
    setLoading(true);
    try {
      await updateTopic.mutateAsync({ id: selected, learningObjectives: text });
      setToast({ message: 'Learning objectives saved', type: 'success' });
      onOpenChange(false);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to save';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Learning Objectives</DialogTitle>
            <DialogDescription>Define or edit learning objectives for a curriculum unit.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Unit</Label>
              <Select value={selected || ''} onValueChange={(v) => setSelected(v || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {(units || []).map((u: CurriculumUnit) => (
                    <SelectItem key={u.id} value={u.id}>{u.name || u.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Learning Objectives (bullet points or paragraphs)</Label>
              <textarea className="w-full h-40 p-2 border rounded" value={text} onChange={(e) => setText(e.target.value)} />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {toast && <AnimatedToast message={toast.message} type={toast.type === 'error' ? 'error' : 'success'} onClose={() => setToast(null)} />}
    </>
  );
}