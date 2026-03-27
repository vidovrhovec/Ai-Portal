'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Route, Clock, Target, ChevronRight, CheckCircle, Play } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface LearningStep {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  prerequisites: string[];
  completed: boolean;
  current: boolean;
}

interface AdaptiveLearningPathProps {
  courseId?: string;
}

export function AdaptiveLearningPath({ courseId }: AdaptiveLearningPathProps) {
  const [currentStep] = useState(0);

  // Fetch learning path from API
  const { data: learningPath, isLoading, error } = useQuery({
    queryKey: ['adaptive-learning-path', courseId],
    queryFn: async () => {
      const url = courseId ? `/api/adaptive-learning/path?courseId=${courseId}` : '/api/adaptive-learning/path';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch learning path');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Prilagodljiva učna pot
          </CardTitle>
          <CardDescription>Nalaganje vaše personalizirane učne poti...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !learningPath?.steps?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Prilagodljiva učna pot
          </CardTitle>
          <CardDescription>
            {error ? 'Napaka pri nalaganju učne poti' : 'Začnite z reševanjem testov za personalizirano pot'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full">
            <Play className="h-4 w-4 mr-2" />
            Začni z učenjem
          </Button>
        </CardContent>
      </Card>
    );
  }

  const steps: LearningStep[] = learningPath.steps;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5" />
          Prilagodljiva učna pot
        </CardTitle>
        <CardDescription>
          Vaša personalizirana pot učenja na podlagi vaše uspešnosti
        </CardDescription>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Napredek</span>
            <span>{currentStep + 1} od {steps.length} korakov</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border transition-colors touch-manipulation ${
                step.completed
                  ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                  : step.current
                  ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
                  : 'bg-muted/50 border-muted'
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                <div className="shrink-0">
                  {step.completed ? (
                    <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                  ) : step.current ? (
                    <div className="h-6 w-6 sm:h-8 sm:w-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Play className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                  ) : (
                    <div className="h-6 w-6 sm:h-8 sm:w-8 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-xs sm:text-sm font-medium text-muted-foreground">{index + 1}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm sm:text-base leading-tight">{step.title}</h4>
                    <Badge variant={
                      step.difficulty === 'beginner' ? 'secondary' :
                      step.difficulty === 'intermediate' ? 'default' : 'destructive'
                    } className="text-xs self-start sm:self-auto">
                      {step.difficulty === 'beginner' ? 'Začetnik' :
                       step.difficulty === 'intermediate' ? 'Srednja' : 'Napredno'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 leading-relaxed">{step.description}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {step.estimatedTime} min
                    </div>
                    {step.prerequisites.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span className="text-xs">Predpogoji: {step.prerequisites.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {step.current && (
                <Button size="sm" className="w-full sm:w-auto self-end sm:self-start shrink-0 touch-manipulation">
                  Začni
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}