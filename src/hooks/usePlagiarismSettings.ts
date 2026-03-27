import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCSRFToken } from '@/lib/utils';

export const usePlagiarismSettings = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['plagiarism-settings'],
    queryFn: async () => {
      const res = await fetch('/api/teacher/plagiarism-settings', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch plagiarism settings');
      return res.json();
    },
  });

  const update = useMutation({
    mutationFn: async (data: any) => {
      const csrf = await getCSRFToken();
      const res = await fetch('/api/teacher/plagiarism-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save plagiarism settings');
      }
      return res.json();
    },
    onSuccess: (res) => {
      queryClient.setQueryData(['plagiarism-settings'], res);
    },
  });

  return { ...query, save: update };
};
