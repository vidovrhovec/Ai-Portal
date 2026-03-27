import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCSRFToken } from '@/lib/utils';

export interface Student {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  studentId: string;
  totalStudyTime: number;
  completedQuizzes: number;
  averageScore: number;
  learningStreak: number;
  lastActivity: string | null;
  strengths: string[];
  weaknesses: string[];
  studyGoals: string[];
  preferredStudyTime: string | null;
  student: {
    id: string;
    name: string | null;
    email: string;
    createdAt: string;
  };
}

export interface StudentMaterial {
  id: string;
  title: string;
  type: string;
  url?: string;
  content?: string;
  courseId?: string;
  teacherId?: string;
  studentId: string;
  createdAt: string;
  course?: {
    id: string;
    title: string;
  };
}

export function useStudents() {
  return useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await fetch('/api/students', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      return response.json();
    },
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { email: string; name: string; password: string }) => {
      const csrfToken = await getCSRFToken();
      const response = await fetch('/api/students', {
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
        throw new Error(error.error || 'Failed to create student');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

export function useStudentProfile(studentId: string) {
  return useQuery({
    queryKey: ['student-profile', studentId],
    queryFn: async () => {
      const response = await fetch(`/api/students/${studentId}/profile`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch student profile');
      }
      return response.json();
    },
    enabled: !!studentId,
  });
}

export function useStudentMaterials(studentId: string) {
  return useQuery({
    queryKey: ['student-materials', studentId],
    queryFn: async () => {
      const response = await fetch(`/api/students/${studentId}/materials`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch student materials');
      }
      return response.json();
    },
    enabled: !!studentId,
  });
}

export function useAssignMaterialToStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { studentId: string; materialData: any }) => {
      const csrfToken = await getCSRFToken();
      
      // Check if materialData is FormData (for file uploads)
      const isFormData = data.materialData instanceof FormData;
      
      const headers: Record<string, string> = {
        'x-csrf-token': csrfToken,
      };
      
      // Don't set Content-Type for FormData, let the browser set it with boundary
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(`/api/students/${data.studentId}/materials`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: isFormData ? data.materialData : JSON.stringify(data.materialData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to assign material to student');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-materials', variables.studentId] });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentId: string) => {
      const csrfToken = await getCSRFToken();
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete student');
      }

      return res.json();
    },
    onSuccess: (_, studentId) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student-profile', studentId as string] });
      queryClient.invalidateQueries({ queryKey: ['student-materials', studentId as string] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });
}

export const useEnrollments = () => {
  return useQuery({
    queryKey: ['enrollments'],
    queryFn: async () => {
      const res = await fetch('/api/enrollments', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch enrollments');
      return res.json();
    },
  });
};

export const useProgress = () => {
  return useQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      const res = await fetch('/api/students/profile', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch progress');
      const data = await res.json();
      return data.progress || [];
    },
  });
};

export const useAnalyticsProgress = () => {
  return useQuery({
    queryKey: ['analytics-progress'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/progress', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch analytics progress');
      return res.json();
    },
  });
};

export const useAnalyticsSuggestions = () => {
  return useQuery({
    queryKey: ['analytics-suggestions'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/suggestions', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch analytics suggestions');
      return res.json();
    },
  });
};

export const useAnalyticsComparison = () => {
  return useQuery({
    queryKey: ['analytics-comparison'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/comparison', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch analytics comparison');
      return res.json();
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const res = await fetch('/api/users/me', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch current user');
      return res.json();
    },
  });
};
