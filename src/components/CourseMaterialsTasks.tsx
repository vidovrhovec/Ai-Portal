import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateMaterial } from '@/hooks/useMaterials';
import { Upload, Link } from 'lucide-react';

export default function CourseMaterialsTasks({ courseId }: { courseId: string }) {
  const [materials, setMaterials] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [materialForm, setMaterialForm] = useState({ title: '', url: '', type: 'pdf', content: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [taskForm, setTaskForm] = useState({ title: '', description: '', dueDate: '' });
  const [message, setMessage] = useState('');

  const createMaterial = useCreateMaterial();

  useEffect(() => {
    console.log('CourseMaterialsTasks: Fetching materials for course:', courseId);
    axios.get(`/api/materials?courseId=${courseId}`)
      .then(res => {
        console.log('CourseMaterialsTasks: Materials response:', res);
        setMaterials(res.data);
      })
      .catch(error => {
        console.error('CourseMaterialsTasks: Error fetching materials:', error);
      });

    console.log('CourseMaterialsTasks: Fetching tasks for course:', courseId);
    axios.get(`/api/course-tasks?courseId=${courseId}`)
      .then(res => {
        console.log('CourseMaterialsTasks: Tasks response:', res);
        setTasks(res.data);
      })
      .catch(error => {
        console.error('CourseMaterialsTasks: Error fetching tasks:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [courseId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      // Auto-detect type based on file
      if (file.type.startsWith('image/')) {
        setMaterialForm(prev => ({ ...prev, type: 'image' }));
      } else if (file.type === 'application/pdf') {
        setMaterialForm(prev => ({ ...prev, type: 'pdf' }));
      } else if (file.type.startsWith('video/')) {
        setMaterialForm(prev => ({ ...prev, type: 'video' }));
      }
    }
  };

  const handleAddMaterial = async () => {
    try {
      if (uploadMethod === 'url') {
        await createMaterial.mutateAsync({
          courseId,
          title: materialForm.title,
          type: materialForm.type,
          url: materialForm.url,
          content: materialForm.content,
        });
      } else if (uploadMethod === 'file' && selectedFile) {
        // Handle file upload
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('courseId', courseId);
        formData.append('title', materialForm.title);
        formData.append('type', materialForm.type);

        const res = await fetch('/api/materials', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Failed to upload file');
      }

      setMaterialForm({ title: '', url: '', type: 'pdf', content: '' });
      setSelectedFile(null);
    } catch (error) {
      console.error('Failed to add material:', error);
    }
  };

  const handleAddTask = async () => {
    setMessage('');
    try {
      const res = await axios.post('/api/course-tasks', { ...taskForm, courseId });
      setTasks([...tasks, res.data]);
      setTaskForm({ title: '', description: '', dueDate: '' });
      setMessage('Naloga uspešno dodana!');
    } catch (e: any) {
      setMessage(e.response?.data?.error || 'Napaka pri dodajanju naloge.');
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-xl font-bold mb-2">Gradiva</h3>
      <div className="mb-4 space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Naslov gradiva"
            value={materialForm.title}
            onChange={e => setMaterialForm(f => ({ ...f, title: e.target.value }))}
            className="w-48"
          />
          <Select value={materialForm.type} onValueChange={(value) => setMaterialForm(f => ({ ...f, type: value }))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="link">Povezava</SelectItem>
              <SelectItem value="image">Slika</SelectItem>
              <SelectItem value="text">Besedilo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Label className="flex items-center space-x-2">
            <span>Način nalaganja:</span>
          </Label>
          <Button
            type="button"
            variant={uploadMethod === 'url' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUploadMethod('url')}
            className="flex items-center space-x-1"
          >
            <Link className="h-4 w-4" />
            <span>URL</span>
          </Button>
          <Button
            type="button"
            variant={uploadMethod === 'file' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUploadMethod('file')}
            className="flex items-center space-x-1"
          >
            <Upload className="h-4 w-4" />
            <span>Datoteka</span>
          </Button>
        </div>

        {uploadMethod === 'url' && (
          <div className="flex gap-2">
            <Input
              placeholder="URL gradiva"
              value={materialForm.url}
              onChange={e => setMaterialForm(f => ({ ...f, url: e.target.value }))}
              className="w-64"
            />
            {(materialForm.type === 'text' || materialForm.type === 'pdf') && (
              <Input
                placeholder="Vsebina (opcijsko)"
                value={materialForm.content}
                onChange={e => setMaterialForm(f => ({ ...f, content: e.target.value }))}
                className="w-64"
              />
            )}
          </div>
        )}

        {uploadMethod === 'file' && (
          <div className="space-y-2">
            <Input
              type="file"
              onChange={handleFileChange}
              accept="image/*,video/*,application/pdf,text/*"
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Izbrana datoteka: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        )}

        <Button
          onClick={handleAddMaterial}
          disabled={createMaterial.isPending || !materialForm.title || (uploadMethod === 'url' && !materialForm.url) || (uploadMethod === 'file' && !selectedFile)}
        >
          {createMaterial.isPending ? 'Dodajanje...' : 'Dodaj gradivo'}
        </Button>
      </div>
      <ul className="mb-6">
        {materials.map(mat => (
          <li key={mat.id} className="mb-2 border-b pb-2">
            <span className="font-semibold">{mat.title}</span> (<span>{mat.type}</span>): <a href={mat.url} className="text-blue-700 underline" target="_blank" rel="noopener noreferrer">{mat.url}</a>
          </li>
        ))}
      </ul>
      <h3 className="text-xl font-bold mb-2">Naloge</h3>
      <div className="mb-4 flex gap-2">
        <input className="border p-2 w-48" placeholder="Naslov naloge" value={taskForm.title} onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))} />
        <input className="border p-2 w-64" placeholder="Opis naloge" value={taskForm.description} onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))} />
        <input className="border p-2 w-40" type="date" value={taskForm.dueDate} onChange={e => setTaskForm(f => ({ ...f, dueDate: e.target.value }))} />
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleAddTask}>Dodaj nalogo</button>
      </div>
      <ul>
        {tasks.map(task => (
          <li key={task.id} className="mb-2 border-b pb-2">
            <span className="font-semibold">{task.title}</span>: {task.description} <span className="ml-2 text-sm text-gray-600">Rok: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</span>
          </li>
        ))}
      </ul>
      {message && <div className="mt-4 text-green-700">{message}</div>}
      {loading && <div>Nalaganje ...</div>}
    </div>
  );
}
