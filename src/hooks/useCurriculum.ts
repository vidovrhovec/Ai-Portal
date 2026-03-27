import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCSRFToken } from '@/lib/utils';

export function useCurriculum() {
  const queryClient = useQueryClient();

  function useSubjects() {
    return useQuery({
      queryKey: ['curriculum', 'subjects'],
      queryFn: async () => {
        const res = await fetch('/api/curriculum/subjects', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch subjects');
        return res.json();
      },
    });
  }

  function useTopics(subjectCode?: string) {
    return useQuery({
      queryKey: ['curriculum', 'topics', subjectCode || 'all'],
      queryFn: async () => {
        const url = subjectCode ? `/api/curriculum/topics?subjectCode=${encodeURIComponent(subjectCode)}` : '/api/curriculum/topics';
        const res = await fetch(url, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch topics');
        return res.json();
      },
      enabled: true,
    });
  }

  function useCreateTopic() {
    return useMutation({
      mutationFn: async (data: { subjectCode: string; name: string; description?: string; gradeLevelId?: string }) => {
        const csrf = await getCSRFToken();
        const res = await fetch('/api/curriculum/topics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrf,
          },
          credentials: 'include',
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to create topic');
        }
        return res.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['curriculum', 'topics'] });
        queryClient.invalidateQueries({ queryKey: ['curriculum', 'subjects'] });
      },
    });
  }

  function useUpdateTopic() {
    return useMutation({
      mutationFn: async (data: { id: string; name?: string; description?: string; startDate?: string; endDate?: string }) => {
        const csrf = await getCSRFToken();
        const res = await fetch('/api/curriculum/topics', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrf,
          },
          credentials: 'include',
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to update topic');
        }
        return res.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['curriculum', 'topics'] });
        queryClient.invalidateQueries({ queryKey: ['curriculum', 'subjects'] });
      },
    });
  }

  return { useSubjects, useTopics, useCreateTopic, useUpdateTopic };
}

export type { };
