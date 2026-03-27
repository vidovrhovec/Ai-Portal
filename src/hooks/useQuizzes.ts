import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCSRFToken } from '@/lib/utils';
import type { QuizQuestionInput } from '@/types';

export interface Quiz {
  id: string;
  title: string;
  questions: string; // JSON string
  courseId: string;
  teacherId: string;
  createdAt: string;
  course: {
    id: string;
    title: string;
  };
}

export function useQuizzes(courseId?: string) {
  return useQuery({
    queryKey: ['quizzes', courseId],
    queryFn: async () => {
      const url = courseId ? `/api/quizzes?courseId=${courseId}` : '/api/quizzes';
      const response = await fetch(url, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch quizzes');
      }
      return response.json();
    },
  });
}

export function useCreateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      questions: QuizQuestionInput[];
      courseId: string;
    }) => {
      const csrfToken = await getCSRFToken();
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create quiz');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
}
