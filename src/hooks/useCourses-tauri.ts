import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Type definitions for Tauri invoke function
type TauriInvoke = (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;

// Dynamic import for Tauri to avoid SSR issues and TypeScript errors
const getTauriInvoke = async (): Promise<TauriInvoke | null> => {
  if (typeof window !== 'undefined' && '__TAURI__' in window) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return invoke as TauriInvoke;
    } catch {
      return null;
    }
  }
  return null;
};

export const useCoursesTauri = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      try {
        const invoke = await getTauriInvoke();
        // Try Tauri IPC first
        if (invoke) {
          return await invoke('get_courses', {
            userId: 'current-user', // This should come from auth context
            role: 'TEACHER', // This should come from auth context
          });
        }
        // Fallback to HTTP API
        const res = await fetch('/api/courses', {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch courses');
        return res.json();
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        throw error;
      }
    },
  });
};

export const useCreateCourseTauri = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { title: string; description?: string; teacherId: string }) => {
      try {
        const invoke = await getTauriInvoke();
        // Try Tauri IPC first
        if (invoke) {
          return await invoke('create_course', {
            title: data.title,
            description: data.description,
            teacherId: data.teacherId,
          });
        }
        // Fallback to HTTP API
        const res = await fetch('/api/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to create course');
        return res.json();
      } catch (error) {
        console.error('Failed to create course:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useUpdateCourseTauri = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { courseId: string; title?: string; description?: string }) => {
      try {
        const invoke = await getTauriInvoke();
        // Try Tauri IPC first
        if (invoke) {
          await invoke('update_course', {
            courseId: data.courseId,
            title: data.title,
            description: data.description,
          });
          return { success: true };
        }
        // Fallback to HTTP API
        const res = await fetch('/api/courses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update course');
        return res.json();
      } catch (error) {
        console.error('Failed to update course:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useDeleteCourseTauri = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      try {
        const invoke = await getTauriInvoke();
        // Try Tauri IPC first
        if (invoke) {
          await invoke('delete_course', { courseId });
          return { success: true };
        }
        // Fallback to HTTP API
        const res = await fetch(`/api/courses/${courseId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to delete course');
        return res.json();
      } catch (error) {
        console.error('Failed to delete course:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};