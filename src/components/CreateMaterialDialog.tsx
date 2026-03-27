'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCreateMaterial } from '@/hooks/useMaterials';
import { useCourses } from '@/hooks';
import type { Course } from '@/types';
import { FileText, AlertCircle, Upload, Link } from 'lucide-react';

interface CreateMaterialDialogProps {
  children: React.ReactNode;
}

export function CreateMaterialDialog({ children }: CreateMaterialDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'text',
    url: '',
    content: '',
    courseId: 'none',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');

  const createMaterial = useCreateMaterial();
  const { data: courses } = useCourses();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      // Auto-detect type based on file
      if (file.type.startsWith('image/')) {
        setFormData(prev => ({ ...prev, type: 'image' }));
      } else if (file.type === 'application/pdf') {
        setFormData(prev => ({ ...prev, type: 'pdf' }));
      } else if (file.type.startsWith('video/')) {
        setFormData(prev => ({ ...prev, type: 'video' }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let dataToSubmit: any;

      if (uploadMethod === 'file' && selectedFile) {
        // Use FormData for file uploads
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('type', formData.type);
        formDataToSend.append('file', selectedFile);
        if (formData.content) formDataToSend.append('content', formData.content);
        if (formData.courseId !== 'none') formDataToSend.append('courseId', formData.courseId);

        dataToSubmit = formDataToSend;
      } else {
        // Use JSON for URL-based materials
        dataToSubmit = {
          ...formData,
          courseId: formData.courseId === 'none' ? undefined : formData.courseId,
        };
      }

      await createMaterial.mutateAsync(dataToSubmit);
      setFormData({
        title: '',
        type: 'text',
        url: '',
        content: '',
        courseId: 'none',
      });
      setSelectedFile(null);
      setUploadMethod('url');
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
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Dodaj novo gradivo</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Naslov gradiva</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Naslov gradiva"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Način nalaganja</Label>
            <div className="flex space-x-2">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Vrsta gradiva</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Izberi vrsto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Besedilo</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="link">Povezava</SelectItem>
                <SelectItem value="image">Slika</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {uploadMethod === 'file' && (
            <div className="space-y-2">
              <Label htmlFor="file">Izberi datoteko</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept="image/*,video/*,application/pdf,text/*"
                required={uploadMethod === 'file'}
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Izbrana datoteka: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="courseId">Poveži s tečajem (opcijsko)</Label>
            <Select value={formData.courseId} onValueChange={(value) => setFormData(prev => ({ ...prev, courseId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Izberi tečaj" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Brez tečaja</SelectItem>
                {courses?.map((course: Course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {uploadMethod === 'url' && formData.type === 'link' && (
            <div className="space-y-2">
              <Label htmlFor="url">URL povezava</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://example.com"
                required
              />
            </div>
          )}

          {uploadMethod === 'url' && (formData.type === 'text' || formData.type === 'pdf') && (
            <div className="space-y-2">
              <Label htmlFor="content">Vsebina</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Vnesite vsebino gradiva..."
                rows={4}
                required
              />
            </div>
          )}

          {createMaterial.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {createMaterial.error.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Prekliči
            </Button>
            <Button type="submit" disabled={createMaterial.isPending}>
              {createMaterial.isPending ? 'Dodajanje...' : 'Dodaj gradivo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}