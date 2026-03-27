import type { Mock } from 'vitest';
import type { Session } from 'next-auth';

// Mock type definitions for better TypeScript support in tests

// Re-export Mock from vitest for test files
export type { Mock };

export type MockAuth = Mock<() => Promise<Session | null>>;

export interface MockPrismaClient {
  user: {
    findMany: Mock;
    findUnique: Mock;
    create: Mock;
    update: Mock;
    delete: Mock;
  };
  course: {
    findMany: Mock;
    findUnique: Mock;
    create: Mock;
    update: Mock;
    delete: Mock;
  };
  material: {
    findMany: Mock;
    findUnique: Mock;
    create: Mock;
    update: Mock;
    delete: Mock;
  };
  quiz: {
    findMany: Mock;
    findUnique: Mock;
    create: Mock;
    update: Mock;
    delete: Mock;
  };
  flashcardDeck: {
    findMany: Mock;
    findUnique: Mock;
    create: Mock;
    update: Mock;
    delete: Mock;
  };
  flashcard: {
    findMany: Mock;
    findUnique: Mock;
    create: Mock;
    update: Mock;
    delete: Mock;
  };
  flashcardReview: {
    findMany: Mock;
    findUnique: Mock;
    create: Mock;
    update: Mock;
    delete: Mock;
  };
  focusSession: {
    findMany: Mock;
    findUnique: Mock;
    create: Mock;
    update: Mock;
    delete: Mock;
  };
  studentProfile: {
    findMany: Mock;
    findUnique: Mock;
    create: Mock;
    update: Mock;
    delete: Mock;
  };
  dailyActivity: {
    findMany: Mock;
    findUnique: Mock;
    create: Mock;
    update: Mock;
    upsert: Mock;
    delete: Mock;
  };
  group: {
    findMany: Mock;
    findUnique: Mock;
    findFirst: Mock;
    create: Mock;
    update: Mock;
    delete: Mock;
  };
  groupInvite: {
    findMany: Mock;
    findUnique: Mock;
    create: Mock;
    update: Mock;
    delete: Mock;
  };
  fakeTestAssignment: {
    findMany: Mock;
    findUnique: Mock;
    create: Mock;
    update: Mock;
    delete: Mock;
  };
  [key: string]: any; // For other models
}

export interface MockDatabaseAdapter {
  getClient: Mock;
  connect: Mock;
  disconnect: Mock;
  migrate: Mock;
}

export interface MockServiceContainer {
  getUseCaseFactory: Mock;
}

export interface MockUseCaseFactory {
  getGroupsUseCase: Mock;
  createGroupUseCase: Mock;
  addStudentToGroupUseCase: Mock;
}

export interface MockVectorAdapter {
  store: Mock;
  search: Mock;
  delete: Mock;
}

// Analytics event metadata interfaces
export interface ProgressEventMetadata {
  points: number;
  topicId?: string;
  materialId?: string;
  timeSpent?: number;
}

export interface QuizEventMetadata {
  score: number;
  totalQuestions: number;
  timeSpent: number;
  quizId: string;
}

export interface MaterialEventMetadata {
  materialId: string;
  timeSpent: number;
  completed: boolean;
}

export type AnalyticsEventMetadata =
  | ProgressEventMetadata
  | QuizEventMetadata
  | MaterialEventMetadata;