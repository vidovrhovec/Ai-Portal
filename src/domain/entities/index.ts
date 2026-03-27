import type { QuizQuestion } from '@/types';

export class UserEntity {
  id!: string;
  email!: string;
  name?: string;
  password!: string;
  role!: string;

  constructor(data: Partial<UserEntity>) {
    Object.assign(this, data);
  }
}

export class CourseEntity {
  id!: string;
  title!: string;
  description?: string;
  teacherId!: string;

  constructor(data: Partial<CourseEntity>) {
    Object.assign(this, data);
  }
}

export class MaterialEntity {
  id!: string;
  title!: string;
  type!: string;
  url?: string;
  content?: string;
  courseId!: string;

  constructor(data: Partial<MaterialEntity>) {
    Object.assign(this, data);
  }
}

export class QuizEntity {
  id!: string;
  title!: string;
  questions!: QuizQuestion[];
  courseId!: string;
  teacherId!: string;
  userId?: string | null;
  score?: number;

  constructor(data: Partial<QuizEntity>) {
    Object.assign(this, data);
  }
}

export class ProgressEntity {
  id!: string;
  userId!: string;
  courseId!: string;
  completed!: boolean;
  score?: number;

  constructor(data: Partial<ProgressEntity>) {
    Object.assign(this, data);
  }
}

// New entities for groups
export class GroupEntity {
  id!: string;
  name!: string;
  description?: string;
  teacherId!: string;

  constructor(data: Partial<GroupEntity>) {
    Object.assign(this, data);
    // Convert null to undefined for optional fields
    if (this.description === null) this.description = undefined;
  }
}

export class GroupMemberEntity {
  id!: string;
  groupId!: string;
  studentId!: string;

  constructor(data: Partial<GroupMemberEntity>) {
    Object.assign(this, data);
  }
}

export class GroupMessageEntity {
  id!: string;
  groupId!: string;
  senderId!: string;
  content!: string;
  createdAt!: Date;

  constructor(data: Partial<GroupMessageEntity>) {
    Object.assign(this, data);
  }
}

// New entities for gamification
export class AchievementEntity {
  id!: string;
  studentId!: string;
  type!: string;
  title!: string;
  description!: string;
  icon!: string;
  points!: number;
  unlockedAt!: Date;
  metadata?: string;

  constructor(data: Partial<AchievementEntity>) {
    Object.assign(this, data);
    // Convert null to undefined for optional fields
    if (this.metadata === null) this.metadata = undefined;
  }
}

export class DailyActivityEntity {
  id!: string;
  studentId!: string;
  date!: Date;
  quizzesCompleted!: number;
  materialsRead!: number;
  studyTimeMinutes!: number;
  pointsEarned!: number;
  streakMaintained!: boolean;

  constructor(data: Partial<DailyActivityEntity>) {
    Object.assign(this, data);
  }
}

// New entities for fake tests
export class FakeTestEntity {
  id!: string;
  studentId?: string;
  subject!: string;
  topic!: string;
  grade!: number;
  difficulty!: string;
  questions!: string;
  assignedStudents?: string;
  createdById?: string;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<FakeTestEntity>) {
    Object.assign(this, data);
    // Convert null to undefined for optional fields
    if (this.studentId === null) this.studentId = undefined;
    if (this.assignedStudents === null) this.assignedStudents = undefined;
    if (this.createdById === null) this.createdById = undefined;
  }
}

export class FakeTestResultEntity {
  id!: string;
  studentId!: string;
  testId!: string;
  subject!: string;
  topic!: string;
  score!: number;
  totalQuestions!: number;
  grade!: string;
  feedback!: string;
  answers!: string;

  constructor(data: Partial<FakeTestResultEntity>) {
    Object.assign(this, data);
  }
}

export class FakeTestAssignmentEntity {
  id!: string;
  testId!: string;
  studentId!: string;
  assignedById!: string;
  completed!: boolean;
  completedAt?: Date;

  constructor(data: Partial<FakeTestAssignmentEntity>) {
    Object.assign(this, data);
    // Convert null to undefined for optional fields
    if (this.completedAt === null) this.completedAt = undefined;
  }
}

// New entities for curriculum
export class CurriculumSubjectEntity {
  id!: string;
  name!: string;
  code!: string;
  description?: string;

  constructor(data: Partial<CurriculumSubjectEntity>) {
    Object.assign(this, data);
    // Convert null to undefined for optional fields
    if (this.description === null) this.description = undefined;
  }
}

export class CurriculumGradeLevelEntity {
  id!: string;
  level!: number;
  name!: string;
  stage!: string;

  constructor(data: Partial<CurriculumGradeLevelEntity>) {
    Object.assign(this, data);
  }
}

export class CurriculumTopicEntity {
  id!: string;
  subjectId!: string;
  gradeLevelId!: string;
  name!: string;
  code!: string;
  description?: string;
  competencies!: string;
  difficulty!: string;
  prerequisites!: string;
  learningObjectives!: string;
  keywords!: string;

  constructor(data: Partial<CurriculumTopicEntity>) {
    Object.assign(this, data);
    // Convert null to undefined for optional fields
    if (this.description === null) this.description = undefined;
  }
}

// Additional entities for AI settings and student profile
export class AISettingsEntity {
  id!: string;
  userId!: string;
  provider!: string;
  apiKey!: string;
  baseUrl!: string;
  model!: string;
  enableWebTTS!: boolean;
  ttsProvider!: string;
  ttsModel?: string;
  enableWebSTT!: boolean;
  sttProvider!: string;
  sttModel?: string;
  enableInternetSearch!: boolean;
  searchProvider!: string;
  searchApiKey?: string;
  userLanguage!: string;
  userCountry!: string;
  educationLevel!: string;
  mentorPersona!: string;

  constructor(data: Partial<AISettingsEntity>) {
    Object.assign(this, data);
    // Convert null to undefined for optional fields
    if (this.ttsModel === null) this.ttsModel = undefined;
    if (this.sttModel === null) this.sttModel = undefined;
    if (this.searchApiKey === null) this.searchApiKey = undefined;
  }
}

export class StudentProfileEntity {
  id!: string;
  studentId!: string;
  gradeLevel?: number;
  schoolName?: string;
  interests?: string;
  totalStudyTime!: number;
  coursesCompleted!: number;
  quizzesTaken!: number;
  totalTestsTaken!: number;
  averageScore!: number;
  averageTestScore!: number;
  lastActivity?: Date;
  aiInsights?: string;
  lastInsightUpdate?: Date;
  totalPoints!: number;
  currentStreak!: number;
  longestStreak!: number;
  lastStreakDate?: Date;
  unlockedThemes!: string;
  unlockedFeatures!: string;

  constructor(data: Partial<StudentProfileEntity>) {
    Object.assign(this, data);
    // Convert null to undefined for optional fields
    if (this.gradeLevel === null) this.gradeLevel = undefined;
    if (this.schoolName === null) this.schoolName = undefined;
    if (this.interests === null) this.interests = undefined;
    if (this.lastActivity === null) this.lastActivity = undefined;
    if (this.aiInsights === null) this.aiInsights = undefined;
    if (this.lastInsightUpdate === null) this.lastInsightUpdate = undefined;
    if (this.lastStreakDate === null) this.lastStreakDate = undefined;
  }
}
