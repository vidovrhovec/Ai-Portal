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

interface AdaptiveLearningPath {
  steps: LearningStep[];
  totalSteps: number;
  completedSteps: number;
}

export function useAdaptiveLearning(courseId?: string) {
  return useQuery<AdaptiveLearningPath>({
    queryKey: ['adaptive-learning-path', courseId],
    queryFn: async () => {
      const url = courseId
        ? `/api/adaptive-learning/path?courseId=${courseId}`
        : '/api/adaptive-learning/path';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch learning path');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useAdaptiveLearningNextMaterial() {
  return useQuery({
    queryKey: ['adaptive-learning-next-material'],
    queryFn: async () => {
      const res = await fetch('/api/adaptive-learning/next-material');
      if (!res.ok) throw new Error('Failed to fetch next material');
      return res.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}