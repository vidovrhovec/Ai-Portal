import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCSRFToken } from '@/lib/utils';

export interface Material {
  id: string;
  title: string;
  type: string;
  url?: string;
  content?: string;
  courseId?: string;
  teacherId?: string;
  studentId?: string;
  completed?: boolean;
  createdAt: string;
  course?: {
    id: string;
    title: string;
  };
}

export function useMaterials(courseId?: string) {
  return useQuery({
    queryKey: ['materials', courseId],
    queryFn: async () => {
      const url = courseId ? `/api/materials?courseId=${courseId}` : '/api/materials';
      const response = await fetch(url, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch materials');
      }
      return response.json();
    },
  });
}

export function useCreateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const csrfToken = await getCSRFToken();
      
      // Check if data is FormData (for file uploads)
      const isFormData = data instanceof FormData;
      
      const headers: Record<string, string> = {
        'x-csrf-token': csrfToken,
      };
      
      // Don't set Content-Type for FormData, let the browser set it with boundary
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch('/api/materials', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: isFormData ? data : JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create material');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
}
