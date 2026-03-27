/**
 * Lazy-loaded components with loading states
 * This file centralizes all lazy imports for better code splitting
 */

'use client';

import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Common loading component
export const LoadingFallback = ({ message = 'Nalaganje...' }: { message?: string }) => (
  <div className="flex items-center justify-center p-8">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  </div>
);

// AI Components
export const LazyAISettings = lazy(() => import('@/components/AISettings').then(mod => ({ default: mod.AISettings })));
export const LazyELI5Dialog = lazy(() => import('@/components/ELI5Dialog').then(mod => ({ default: mod.ELI5Dialog })));

// Assessment Components
export const LazyFakeTestGenerator = lazy(() => import('@/components/FakeTestGenerator').then(mod => ({ default: mod.FakeTestGenerator })));
export const LazyTeacherFakeTestGenerator = lazy(() => import('@/components/TeacherFakeTestGenerator').then(mod => ({ default: mod.TeacherFakeTestGenerator })));

// Learning Tools
export const LazyFlashcards = lazy(() => import('@/components/Flashcards').then(mod => ({ default: mod.Flashcards })));
export const LazyFocusMode = lazy(() => import('@/components/FocusMode').then(mod => ({ default: mod.FocusMode })));

// Analytics & Gamification
export const LazyGamificationDashboard = lazy(() => import('@/components/GamificationDashboard').then(mod => ({ default: mod.GamificationDashboard })));
export const LazyKnowledgeHeatmap = lazy(() => import('@/components/KnowledgeHeatmap').then(mod => ({ default: mod.KnowledgeHeatmap })));
export const LazyAdaptiveLearningPath = lazy(() => import("@/components/adaptive-learning").then(mod => ({ default: mod.AdaptiveLearningPath })));

// Dashboard Pages
export const LazyStudentDashboard = lazy(() => import('@/app/dashboard/student/page').then(mod => ({ default: mod.default })));
export const LazyTeacherDashboard = lazy(() => import('@/app/dashboard/teacher/page').then(mod => ({ default: mod.default })));

// Helper to wrap lazy components with Suspense
export function withSuspense<P extends object>(
  Component: React.LazyExoticComponent<React.ComponentType<P>>,
  fallback?: React.ReactNode,
  message?: string
) {
  return (props: P) => (
    <Suspense fallback={fallback || <LoadingFallback message={message} />}>
      <Component {...props} />
    </Suspense>
  );
}

// Pre-wrapped components ready to use
export const AISettings = withSuspense(LazyAISettings, undefined, 'Nalaganje AI nastavitev...');
export const ELI5Dialog = withSuspense(LazyELI5Dialog, undefined, 'Nalaganje ELI5...');
export const FakeTestGenerator = withSuspense(LazyFakeTestGenerator, undefined, 'Nalaganje generatorja testov...');
export const TeacherFakeTestGenerator = withSuspense(LazyTeacherFakeTestGenerator, undefined, 'Nalaganje učiteljevega generatorja...');
export const Flashcards = withSuspense(LazyFlashcards, undefined, 'Nalaganje kartic...');
export const FocusMode = withSuspense(LazyFocusMode, undefined, 'Nalaganje fokusa...');
export const GamificationDashboard = withSuspense(LazyGamificationDashboard, undefined, 'Nalaganje gamifikacije...');
export const KnowledgeHeatmap = withSuspense(LazyKnowledgeHeatmap, undefined, 'Nalaganje zemljevida...');
export const StudentDashboard = withSuspense(LazyStudentDashboard, undefined, 'Nalaganje študentskega nadzorne plošče...');
export const TeacherDashboard = withSuspense(LazyTeacherDashboard, undefined, 'Nalaganje učiteljevega nadzorne plošče...');
export { AdaptiveLearningPath } from '@/components/adaptive-learning';
