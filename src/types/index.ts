import type { User, Course, Material, Quiz, Progress } from '@prisma/client';

export type { User, Course, Material, Quiz, Progress };

// Role and MaterialType are now strings (removed enums for SQLite compatibility)

// Additional types for forms and APIs
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  name: string;
  password: string;
  role?: string;
}

export interface CourseForm {
  title: string;
  description?: string;
}

export interface MaterialForm {
  title: string;
  type: string;
  url?: string;
  content?: string;
  courseId: string;
}

export interface QuizForm {
  title: string;
  questions: QuizQuestionInput[];
  courseId: string;
}

export interface AIQuery {
  query: string;
  context?: string;
}

export interface AIResponse {
  response: string;
  sources?: string[];
}

// AI-specific types
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface QuizData {
  title: string;
  questions: QuizQuestion[];
}

export interface TestQuestion {
  type?: 'multiple-choice' | 'short-answer' | 'essay';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface TestData {
  title?: string;
  subject?: string;
  grade?: number;
  questions: TestQuestion[];
}

export interface GradingResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  feedback: string;
  detailedResults: {
    question: string;
    correct: boolean;
    explanation: string;
  }[];
}

export interface LearningStyleAnswers {
  [key: string]: string | number;
}

// Vector database types
export interface VectorRecord {
  id: string;
  values: number[];
  metadata?: VectorMetadata;
}

export interface VectorSearchQuery {
  vector: number[];
  topK?: number;
  filter?: Partial<VectorMetadata>;
}

export interface VectorSearchResult {
  id: string;
  score: number;
  metadata?: VectorMetadata;
}

// For dynamic DB config
export interface DBConfig {
  type: 'sqlite' | 'postgresql' | 'mysql';
  url: string;
}

// For AI config
export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'local' | 'custom';
  apiKey?: string;
  baseUrl?: string;
  model: string;
}

// For vector store config
export interface VectorConfig {
  provider: 'pinecone' | 'weaviate' | 'chroma';
  apiKey?: string;
  indexName?: string;
}

// AI generation types
export interface AIGenerationSettings {
  educationLevel?: string;
  userLanguage?: string;
  model?: string;
  mentorPersona?: string;
}

export interface AIGenerationOptions {
  grade?: string;
  language?: string;
  difficulty?: string;
  instructions?: string;
}

// AI model types
export interface AIModel {
  id: string;
  name: string;
  provider: string;
}

// Flashcard types
export interface GeneratedFlashcard {
  front?: string;
  back?: string;
  difficulty?: string;
}

export interface FlashcardReviewData {
  id: string;
  front: string;
  back: string;
  difficulty: string;
  reviewId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
  lastReviewed: Date | null;
}

export interface FlashcardDeckGroup {
  deckId: string;
  deckTitle: string;
  subject: string;
  cards: FlashcardReviewData[];
}

// Database query types
export interface GroupWhereClause {
  teacherId?: string;
  id?: {
    in: string[];
  };
}

export interface UserWhereClause {
  email?: string;
  id?: string;
}

export interface CourseWhereClause {
  teacherId?: string;
  id?: string;
}

export interface MaterialWhereClause {
  courseId?: string;
  id?: string;
}

export interface QuizWhereClause {
  courseId?: string;
  id?: string;
}

export interface ProgressWhereClause {
  studentId?: string;
  materialId?: string;
}

// Test answer types
export interface TestAnswer {
  questionId: string;
  answer: number; // index of selected option
}

export interface TestAnswers {
  [questionId: string]: number;
}

// Assignment answer types (for fake test assignments)
export interface AssignmentAnswers {
  [questionId: string]: string; // text answers for assignments
}

// Question data types
export interface QuestionData {
  id: string;
  question: string;
  correctAnswer: string;
  [key: string]: unknown;
}

// Material access condition types
export interface MaterialAccessCondition {
  studentId?: string;
  teacherId?: string;
}

// Curriculum where clause types
export interface CurriculumTopicWhereClause {
  gradeLevel?: {
    level: number;
  };
  subject?: {
    code: string;
  };
}

// Quiz and material score calculation types
export interface QuizScoreData {
  id: string;
  score?: number;
}

export interface MaterialProgressData {
  id: string;
  completed: boolean;
}

// Curriculum relation types
export interface CurriculumSubjectRelation {
  id: string;
  name: string;
  code: string;
}

export interface CurriculumGradeLevelRelation {
  id: string;
  level: number;
  name: string;
}

export interface CurriculumResource {
  id: string;
  topicId: string;
  title: string;
  type: string;
  content: string;
  difficulty: string;
  estimatedTime: number;
  tags: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CurriculumTopicWithRelations {
  id: string;
  subjectId: string;
  gradeLevelId: string;
  name: string;
  description: string | null;
  competencies: string;
  difficulty: string;
  prerequisites: string;
  learningObjectives: string;
  keywords: string;
  subject: CurriculumSubjectRelation;
  gradeLevel: CurriculumGradeLevelRelation;
  resources: CurriculumResource[];
}

// Metadata types (replacing 'any')
export type VectorMetadata = {
  source?: string;
  type?: string;
  timestamp?: number;
  tags?: string[];
  [key: string]: string | number | boolean | string[] | undefined;
};

// Position, Size, Content, Style types (replacing 'any')
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface CanvasElementContent {
  text?: string;
  url?: string;
  data?: unknown;
}

export interface CanvasElementStyle {
  color?: string;
  fontSize?: number;
  backgroundColor?: string;
  borderRadius?: number;
  [key: string]: string | number | undefined;
}

// Quiz types
export interface QuizQuestionInput {
  question: string;
  options: string[];
  correctAnswer: number;
}