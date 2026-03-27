'use client';

import { useState, useCallback, DragEvent, ChangeEvent } from 'react';
import { Upload, X, File, Image, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUpload: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  type?: 'material' | 'assignment' | 'profile' | 'general';
  courseId?: string;
  className?: string;
}

export interface UploadedFile {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

export function FileUpload({
  onUpload,
  maxFiles = 5,
  maxSize = 10,
  acceptedTypes = ALLOWED_TYPES,
  type = 'general',
  courseId,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const validateFile = (file: File): string | null => {
    if (file.size > (maxSize * 1024 * 1024)) {
      return `Datoteka je prevelika. Največja dovoljena velikost je ${maxSize}MB.`;
    }

    if (!acceptedTypes.includes(file.type)) {
      return 'Tip datoteke ni dovoljen.';
    }

    return null;
  };

  const uploadFile = async (file: File): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (courseId) {
      formData.append('courseId', courseId);
    }

    const response = await fetch('/api/uploads', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const result = await response.json();
    return {
      id: result.file.id,
      url: result.file.url,
      name: result.file.name,
      size: result.file.size,
      type: result.file.type,
      status: 'success',
    };
  };

  const handleFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles: File[] = Array.from(fileList);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate files
    for (const file of newFiles) {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    }

    // Check total file count
    if (files.length + validFiles.length > maxFiles) {
      errors.push(`Največje število datotek je ${maxFiles}.`);
      return;
    }

    // Show validation errors
    if (errors.length > 0) {
      // You could use a toast notification here
      console.error('Validation errors:', errors);
      return;
    }

    setUploading(true);

    // Upload files
    const uploadPromises = validFiles.map(async (file) => {
      try {
        const uploadedFile = await uploadFile(file);
        return uploadedFile;
      } catch (error) {
        return {
          id: `error-${Date.now()}`,
          url: '',
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'error' as const,
          error: error instanceof Error ? error.message : 'Upload failed',
        };
      }
    });

    const uploadedFiles = await Promise.all(uploadPromises);
    setFiles(prev => [...prev, ...uploadedFiles]);
    onUpload(uploadedFiles.filter(f => f.status === 'success'));
    setUploading(false);
  }, [files, maxFiles, onUpload, type, courseId]);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <Card
        className={cn(
          'border-2 border-dashed transition-colors',
          isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          uploading && 'pointer-events-none opacity-50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 px-4">
          <Upload className="h-8 w-8 text-muted-foreground mb-4" />
          <div className="text-center">
            <p className="text-sm font-medium mb-1">
              Povlecite datoteke sem ali kliknite za izbiro
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Največ {maxFiles} datotek, do {maxSize}MB vsaka
            </p>
            <input
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
              disabled={uploading}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={uploading}
            >
              Izberi datoteke
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Nalaganje datotek...</p>
          <Progress value={undefined} className="w-full" />
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Naložene datoteke</p>
          <div className="space-y-2">
            {files.map((file) => (
              <Card key={file.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.type)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {file.status === 'uploading' && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                    )}
                    {file.status === 'success' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {file.error && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription className="text-xs">
                      {file.error}
                    </AlertDescription>
                  </Alert>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Security Notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          Vse datoteke se preverijo za varnost pred nalaganjem. Podprti tipi: slike, PDF, dokumenti in preglednice.
        </AlertDescription>
      </Alert>
    </div>
  );
}