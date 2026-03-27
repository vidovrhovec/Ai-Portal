/**
 * Code Splitting Utilities
 * Dynamic imports for route-based code splitting
 */

export async function dynamicImport<T>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
): Promise<{ default: T }> {
  return importFn();
}

export const dynamicComponents = {
  // Student Dashboard Components
  student: {
    flashcards: () => import('@/components/Flashcards'),
    focusMode: () => import('@/components/FocusMode'),
    fakeTestGenerator: () => import('@/components/FakeTestGenerator'),
  },
  // Teacher Dashboard Components
  teacher: {
    fakeTestGenerator: () => import('@/components/TeacherFakeTestGenerator'),
  },
  // Shared Components
  shared: {
    aiSettings: () => import('@/components/AISettings'),
    gamification: () => import('@/components/GamificationDashboard'),
    knowledgeHeatmap: () => import('@/components/KnowledgeHeatmap'),
    eli5Dialog: () => import('@/components/ELI5Dialog'),
  },
};

export const dynamicPages = {
  student: () => import('@/app/dashboard/student/page'),
  teacher: () => import('@/app/dashboard/teacher/page'),
  login: () => import('@/app/login/page'),
  register: () => import('@/app/register/page'),
};
