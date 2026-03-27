'use client';

import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Brain, FileText, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  progress: number;
  title: string;
  description?: string;
  type?: 'ai' | 'file' | 'message' | 'general';
  className?: string;
}

const icons = {
  ai: Brain,
  file: FileText,
  message: MessageSquare,
  general: Loader2,
};

export function ProgressIndicator({
  progress,
  title,
  description,
  type = 'general',
  className
}: ProgressIndicatorProps) {
  const Icon = icons[type];

  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5 animate-pulse text-primary" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{Math.round(progress)}% complete</span>
            {progress < 100 && (
              <span className="flex items-center">
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Processing...
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface AIProgressProps {
  operation: string;
  progress: number;
  className?: string;
}

export function AIProgress({ operation, progress, className }: AIProgressProps) {
  const getDescription = (op: string) => {
    switch (op) {
      case 'generate-quiz':
        return 'Creating personalized quiz questions...';
      case 'generate-material':
        return 'Generating learning materials...';
      case 'analyze-performance':
        return 'Analyzing your learning progress...';
      case 'generate-feedback':
        return 'Creating personalized feedback...';
      case 'search-content':
        return 'Searching through learning materials...';
      default:
        return 'AI is working on your request...';
    }
  };

  return (
    <ProgressIndicator
      progress={progress}
      title="AI Processing"
      description={getDescription(operation)}
      type="ai"
      className={className}
    />
  );
}