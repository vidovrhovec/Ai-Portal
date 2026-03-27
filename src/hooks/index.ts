// AI za učitelje: Teacher AI Assistant Hook
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useTeacherAI() {
  /**
   * useTeacherAI Hook
   *
   * Pošlje zahtevo na /api/teacher/ai za AI funkcije za učitelje.
   *
   * @returns mutateAsync({ type, ...payload })
   */
  return useMutation({
    mutationFn: async (data: { type: string; [key: string]: unknown }) => {
      const res = await fetch('/api/teacher/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Napaka pri AI zahtevi učitelja');
      return res.json();
    },
  });
}

export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await fetch('/api/courses', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch courses');
      return res.json();
    },
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { title: string; description: string }) => {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create course');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; title: string; description: string }) => {
      const res = await fetch('/api/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update course');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useCreateUser = () => {
  /**
   * useCreateUser Hook
   *
   * React Query mutation hook for user registration.
   *
   * Usage:
   * const createUser = useCreateUser();
   * await createUser.mutateAsync({ email, name, password, role });
   *
   * Parameters:
   * - email: string - User's email
   * - name: string - User's full name
   * - password: string - Plain text password
   * - role: 'STUDENT' | 'TEACHER' - User role (optional)
   *
   * Returns:
   * - User object on success
   * - Throws error on failure (handled by React Query)
   *
   * Error Handling:
   * - Network errors
   * - Validation errors from API
   * - Duplicate email errors
   */
  return useMutation({
    mutationFn: async (data: { email: string; name: string; password: string; role?: string }) => {
      console.log('useCreateUser: Sending request with data:', data);
      try {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        console.log('useCreateUser: Response status:', res.status);
        console.log('useCreateUser: Response ok:', res.ok);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.log('useCreateUser: Error response:', errorText);
          throw new Error(`Failed to create user: ${errorText}`);
        }
        
        const result = await res.json();
        console.log('useCreateUser: Success response:', result);
        return result;
      } catch (error) {
        console.log('useCreateUser: Network error:', error);
        throw error;
      }
    },
  });
};

export const useAIQuery = () => {
  return useMutation({
    mutationFn: async (query: string) => {
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error('Failed to query AI');
      return res.json();
    },
  });
};

export const useGenerateAIInsights = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentId: string) => {
      const res = await fetch(`/api/students/${studentId}/insights`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to generate AI insights');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
    },
  });
};

// Analytics Hooks
export const useAnalyticsProgress = (period = '30d') => {
  /**
   * useAnalyticsProgress Hook
   *
   * Fetches user's progress data for analytics charts
   *
   * @param period - Time period ('7d', '30d', '90d')
   * @returns Progress data with dates, points, and metrics
   */
  return useQuery({
    queryKey: ['analytics', 'progress', period],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/progress?period=${period}`);
      if (!res.ok) throw new Error('Failed to fetch progress data');
      return res.json();
    },
  });
};

export const useAnalyticsSuggestions = () => {
  /**
   * useAnalyticsSuggestions Hook
   *
   * Fetches AI-powered learning suggestions
   *
   * @returns Array of learning suggestions with topics and reasons
   */
  return useQuery({
    queryKey: ['analytics', 'suggestions'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/suggestions');
      if (!res.ok) throw new Error('Failed to fetch suggestions');
      return res.json();
    },
  });
};

export const useAnalyticsWeaknesses = () => {
  /**
   * useAnalyticsWeaknesses Hook
   *
   * Fetches detailed analysis of weak areas
   *
   * @returns Weak topics analysis with scores and recommendations
   */
  return useQuery({
    queryKey: ['analytics', 'weaknesses'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/weaknesses');
      if (!res.ok) throw new Error('Failed to fetch weaknesses analysis');
      return res.json();
    },
  });
};

export const useAnalyticsComparison = () => {
  /**
   * useAnalyticsComparison Hook
   *
   * Fetches anonymous peer comparison data
   *
   * @returns Percentile ranking and class statistics
   */
  return useQuery({
    queryKey: ['analytics', 'comparison'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/comparison');
      if (!res.ok) throw new Error('Failed to fetch comparison data');
      return res.json();
    },
  });
};

// Enrollment hooks

/**
 * useEnrollments Hook
 *
 * Fetches course enrollments based on user role and optional course filter.
 *
 * @param courseId - Optional course ID to filter enrollments (teachers only)
 * @returns Query object with enrollment data
 *
 * For Teachers: Returns all enrollments for their courses, optionally filtered by courseId
 * For Students: Returns only their own enrollments
 *
 * Data includes student and course details based on role permissions.
 */
export const useEnrollments = () => {
  return useQuery({
    queryKey: ['enrollments'],
    queryFn: async () => {
      const res = await fetch('/api/enrollments');
      if (!res.ok) throw new Error('Failed to fetch enrollments');
      return res.json();
    },
  });
};

export const useProgress = () => {
  return useQuery({
    queryKey: ['courses-progress'],
    queryFn: async () => {
      const res = await fetch('/api/courses/progress');
      if (!res.ok) throw new Error('Failed to fetch progress');
      return res.json();
    },
  });
};

export const useMaterials = (courseId?: string) => {
  return useQuery({
    queryKey: ['materials', courseId],
    queryFn: async () => {
      const res = await fetch(`/api/materials${courseId ? `?courseId=${courseId}` : ''}`);
      if (!res.ok) throw new Error('Failed to fetch materials');
      return res.json();
    },
  });
};

export const useQuizzes = (courseId?: string) => {
  return useQuery({
    queryKey: ['quizzes', courseId],
    queryFn: async () => {
      const res = await fetch(`/api/quizzes${courseId ? `?courseId=${courseId}` : ''}`);
      if (!res.ok) throw new Error('Failed to fetch quizzes');
      return res.json();
    },
  });
};

export const useGroups = () => {
  return useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const res = await fetch('/api/groups');
      if (!res.ok) throw new Error('Failed to fetch groups');
      return res.json();
    },
  });
};

/**
 * useEnrollStudent Hook
 *
 * Mutation hook for enrolling a student in a course (Teachers only).
 *
 * @param data.courseId - ID of the course to enroll the student in
 * @param data.studentId - ID of the student to enroll
 * @param data.notes - Optional enrollment notes
 * @returns Mutation object with enroll function and loading states
 *
 * Automatically invalidates enrollment and course queries on success.
 * Triggers auto-assignment of course materials to the student.
 */
export const useEnrollStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { courseId: string; studentId: string; notes?: string }) => {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to enroll student');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

/**
 * useUnenrollStudent Hook
 *
 * Mutation hook for unenrolling a student from a course (Teachers only).
 *
 * @param enrollmentId - ID of the enrollment record to delete
 * @returns Mutation object with unenroll function and loading states
 *
 * Automatically invalidates enrollment and course queries on success.
 * Cascades to remove material assignments while preserving progress history.
 */
export const useUnenrollStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enrollmentId: string) => {
      const res = await fetch(`/api/enrollments?id=${enrollmentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to unenroll student');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

// Weakness Analysis Hook
export function useWeaknessAnalysis() {
  return useQuery({
    queryKey: ['weakness-analysis'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/weakness-analysis');
      if (!res.ok) throw new Error('Napaka pri pridobivanju analitike šibkih točk');
      return res.json();
    },
  });
}

// Re-export the new hooks
export * from './useStudents';
export * from './useMaterials';
export * from './useQuizzes';
export * from './useGroups';
export { useAdaptiveLearning } from './useAdaptiveLearning';

// Curriculum hooks
export * from './useCurriculum';
