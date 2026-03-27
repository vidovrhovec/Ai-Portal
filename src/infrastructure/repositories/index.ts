import { PrismaClient } from '@prisma/client';
import { UserEntity, CourseEntity, GroupEntity, GroupMemberEntity, GroupMessageEntity, AchievementEntity, DailyActivityEntity, FakeTestEntity, FakeTestResultEntity, FakeTestAssignmentEntity, CurriculumSubjectEntity, CurriculumGradeLevelEntity, CurriculumTopicEntity, AISettingsEntity, StudentProfileEntity } from '../../domain/entities';

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(data: Partial<UserEntity>): Promise<UserEntity>;
  update(id: string, data: Partial<UserEntity>): Promise<UserEntity>;
}

export interface ICourseRepository {
  findAll(): Promise<CourseEntity[]>;
  findById(id: string): Promise<CourseEntity | null>;
  create(data: Partial<CourseEntity>): Promise<CourseEntity>;
}

// Group Repository Interfaces
export interface IGroupRepository {
  findAll(teacherId?: string): Promise<GroupEntity[]>;
  findById(id: string): Promise<GroupEntity | null>;
  create(data: Partial<GroupEntity>): Promise<GroupEntity>;
  update(id: string, data: Partial<GroupEntity>): Promise<GroupEntity>;
  delete(id: string): Promise<void>;
}

export interface IGroupMemberRepository {
  findByGroupId(groupId: string): Promise<GroupMemberEntity[]>;
  create(data: Partial<GroupMemberEntity>): Promise<GroupMemberEntity>;
  delete(groupId: string, studentId: string): Promise<void>;
}

export interface IGroupMessageRepository {
  findByGroupId(groupId: string): Promise<GroupMessageEntity[]>;
  create(data: Partial<GroupMessageEntity>): Promise<GroupMessageEntity>;
}

// Gamification Repository Interfaces
export interface IAchievementRepository {
  findByStudentId(studentId: string): Promise<AchievementEntity[]>;
  create(data: Partial<AchievementEntity>): Promise<AchievementEntity>;
}

export interface IDailyActivityRepository {
  findByStudentId(studentId: string): Promise<DailyActivityEntity[]>;
  upsert(data: Partial<DailyActivityEntity>): Promise<DailyActivityEntity>;
}

// Fake Test Repository Interfaces
export interface IFakeTestRepository {
  findAll(): Promise<FakeTestEntity[]>;
  findById(id: string): Promise<FakeTestEntity | null>;
  findByStudentId(studentId: string): Promise<FakeTestEntity[]>;
  create(data: Partial<FakeTestEntity>): Promise<FakeTestEntity>;
}

export interface IFakeTestResultRepository {
  findByStudentId(studentId: string): Promise<FakeTestResultEntity[]>;
  create(data: Partial<FakeTestResultEntity>): Promise<FakeTestResultEntity>;
}

export interface IFakeTestAssignmentRepository {
  findByStudentId(studentId: string): Promise<FakeTestAssignmentEntity[]>;
  create(data: Partial<FakeTestAssignmentEntity>): Promise<FakeTestAssignmentEntity>;
  update(id: string, data: Partial<FakeTestAssignmentEntity>): Promise<FakeTestAssignmentEntity>;
}

// Curriculum Repository Interfaces
export interface ICurriculumSubjectRepository {
  findAll(): Promise<CurriculumSubjectEntity[]>;
  findByCode(code: string): Promise<CurriculumSubjectEntity | null>;
}

export interface ICurriculumGradeLevelRepository {
  findAll(): Promise<CurriculumGradeLevelEntity[]>;
  findByLevel(level: number): Promise<CurriculumGradeLevelEntity | null>;
}

export interface ICurriculumTopicRepository {
  findAll(gradeLevel?: number, subjectCode?: string): Promise<CurriculumTopicEntity[]>;
}

// AI Settings and Student Profile Repository Interfaces
export interface IAISettingsRepository {
  findByUserId(userId: string): Promise<AISettingsEntity | null>;
  upsert(userId: string, data: Partial<AISettingsEntity>): Promise<AISettingsEntity>;
}

export interface IStudentProfileRepository {
  findByStudentId(studentId: string): Promise<StudentProfileEntity | null>;
  upsert(studentId: string, data: Partial<StudentProfileEntity>): Promise<StudentProfileEntity>;
}

export class PrismaUserRepository implements IUserRepository {
  constructor(private client: PrismaClient) {}

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.client.user.findUnique({ where: { id } });
    return user ? new UserEntity({ ...user, name: user.name || undefined, password: user.password || undefined }) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.client.user.findUnique({ where: { email } });
    return user ? new UserEntity({ ...user, name: user.name || undefined, password: user.password || undefined }) : null;
  }

  async create(data: Partial<UserEntity>): Promise<UserEntity> {
    const user = await this.client.user.create({
      data: {
        email: data.email!,
        name: data.name,
        password: data.password!,
        role: data.role!,
      },
    });
    return new UserEntity({ ...user, name: user.name || undefined, password: user.password || undefined });
  }

  async update(id: string, data: Partial<UserEntity>): Promise<UserEntity> {
    const user = await this.client.user.update({
      where: { id },
      data,
    });
    return new UserEntity({ ...user, name: user.name || undefined, password: user.password || undefined });
  }
}

export class PrismaCourseRepository implements ICourseRepository {
  constructor(private client: PrismaClient) {}

  async findAll(): Promise<CourseEntity[]> {
    const courses = await this.client.course.findMany();
    return courses.map((c: any) => new CourseEntity({ ...c, description: c.description || undefined }));
  }

  async findById(id: string): Promise<CourseEntity | null> {
    const course = await this.client.course.findUnique({ where: { id } });
    return course ? new CourseEntity({ ...course, description: course.description || undefined }) : null;
  }

  async create(data: Partial<CourseEntity>): Promise<CourseEntity> {
    const course = await this.client.course.create({
      data: {
        title: data.title!,
        description: data.description,
        teacherId: data.teacherId!,
      },
    });
    return new CourseEntity({ ...course, description: course.description || undefined });
  }
}

// Group Repository Implementations
export class PrismaGroupRepository implements IGroupRepository {
  constructor(private client: PrismaClient) {}

  async findAll(teacherId?: string): Promise<GroupEntity[]> {
    const whereClause = teacherId ? { teacherId } : {};
    const groups = await this.client.group.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
    return groups.map(g => new GroupEntity({ ...g, description: g.description || undefined }));
  }

  async findById(id: string): Promise<GroupEntity | null> {
    const group = await this.client.group.findUnique({ where: { id } });
    return group ? new GroupEntity({ ...group, description: group.description || undefined }) : null;
  }

  async create(data: Partial<GroupEntity>): Promise<GroupEntity> {
    const group = await this.client.group.create({
      data: {
        name: data.name!,
        description: data.description,
        teacherId: data.teacherId!,
      },
    });
    return new GroupEntity({ ...group, description: group.description || undefined });
  }

  async update(id: string, data: Partial<GroupEntity>): Promise<GroupEntity> {
    const group = await this.client.group.update({
      where: { id },
      data,
    });
    return new GroupEntity({ ...group, description: group.description || undefined });
  }

  async delete(id: string): Promise<void> {
    await this.client.group.delete({ where: { id } });
  }
}

export class PrismaGroupMemberRepository implements IGroupMemberRepository {
  constructor(private client: PrismaClient) {}

  async findByGroupId(groupId: string): Promise<GroupMemberEntity[]> {
    const members = await this.client.groupMember.findMany({
      where: { groupId },
    });
    return members.map(m => new GroupMemberEntity(m));
  }

  async create(data: Partial<GroupMemberEntity>): Promise<GroupMemberEntity> {
    const member = await this.client.groupMember.create({
      data: {
        groupId: data.groupId!,
        studentId: data.studentId!,
      },
    });
    return new GroupMemberEntity(member);
  }

  async delete(groupId: string, studentId: string): Promise<void> {
    await this.client.groupMember.delete({
      where: {
        groupId_studentId: {
          groupId,
          studentId,
        },
      },
    });
  }
}

export class PrismaGroupMessageRepository implements IGroupMessageRepository {
  constructor(private client: PrismaClient) {}

  async findByGroupId(groupId: string): Promise<GroupMessageEntity[]> {
    const messages = await this.client.groupMessage.findMany({
      where: { groupId },
      orderBy: { createdAt: 'asc' },
    });
    return messages.map(m => new GroupMessageEntity(m));
  }

  async create(data: Partial<GroupMessageEntity>): Promise<GroupMessageEntity> {
    const message = await this.client.groupMessage.create({
      data: {
        groupId: data.groupId!,
        senderId: data.senderId!,
        content: data.content!,
      },
    });
    return new GroupMessageEntity(message);
  }
}

// Gamification Repository Implementations
export class PrismaAchievementRepository implements IAchievementRepository {
  constructor(private client: PrismaClient) {}

  async findByStudentId(studentId: string): Promise<AchievementEntity[]> {
    const achievements = await this.client.achievement.findMany({
      where: { studentId },
      orderBy: { unlockedAt: 'desc' },
    });
    return achievements.map(a => new AchievementEntity({
      ...a,
      metadata: a.metadata || undefined,
    }));
  }

  async create(data: Partial<AchievementEntity>): Promise<AchievementEntity> {
    const achievement = await this.client.achievement.create({
      data: {
        studentId: data.studentId!,
        type: data.type!,
        title: data.title!,
        description: data.description!,
        icon: data.icon!,
        points: data.points || 0,
        metadata: data.metadata,
      },
    });
    return new AchievementEntity({
      ...achievement,
      metadata: achievement.metadata || undefined,
    });
  }
}

export class PrismaDailyActivityRepository implements IDailyActivityRepository {
  constructor(private client: PrismaClient) {}

  async findByStudentId(studentId: string): Promise<DailyActivityEntity[]> {
    const activities = await this.client.dailyActivity.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
    });
    return activities.map(a => new DailyActivityEntity(a));
  }

  async upsert(data: Partial<DailyActivityEntity>): Promise<DailyActivityEntity> {
    const activity = await this.client.dailyActivity.upsert({
      where: {
        studentId_date: {
          studentId: data.studentId!,
          date: data.date!,
        },
      },
      update: {
        quizzesCompleted: data.quizzesCompleted,
        materialsRead: data.materialsRead,
        pointsEarned: data.pointsEarned,
        streakMaintained: data.streakMaintained,
      },
      create: {
        studentId: data.studentId!,
        date: data.date!,
        quizzesCompleted: data.quizzesCompleted || 0,
        materialsRead: data.materialsRead || 0,
        pointsEarned: data.pointsEarned || 0,
        streakMaintained: data.streakMaintained || false,
      },
    });
    return new DailyActivityEntity(activity);
  }
}

// Fake Test Repository Implementations
export class PrismaFakeTestRepository implements IFakeTestRepository {
  constructor(private client: PrismaClient) {}

  async findAll(): Promise<FakeTestEntity[]> {
    const tests = await this.client.fakeTest.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return tests.map(t => new FakeTestEntity({
      ...t,
      studentId: t.studentId || undefined,
      assignedStudents: t.assignedStudents || undefined,
      createdById: t.createdById || undefined,
    }));
  }

  async findById(id: string): Promise<FakeTestEntity | null> {
    const test = await this.client.fakeTest.findUnique({ where: { id } });
    return test ? new FakeTestEntity({
      ...test,
      studentId: test.studentId || undefined,
      assignedStudents: test.assignedStudents || undefined,
      createdById: test.createdById || undefined,
    }) : null;
  }

  async findByStudentId(studentId: string): Promise<FakeTestEntity[]> {
    const tests = await this.client.fakeTest.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });
    return tests.map(t => new FakeTestEntity({
      ...t,
      studentId: t.studentId || undefined,
      assignedStudents: t.assignedStudents || undefined,
      createdById: t.createdById || undefined,
    }));
  }

  async create(data: Partial<FakeTestEntity>): Promise<FakeTestEntity> {
    const test = await this.client.fakeTest.create({
      data: {
        studentId: data.studentId,
        subject: data.subject!,
        topic: data.topic!,
        grade: data.grade!,
        difficulty: data.difficulty || 'medium',
        questions: data.questions!,
        assignedStudents: data.assignedStudents,
        createdById: data.createdById,
      },
    });
    return new FakeTestEntity({
      ...test,
      studentId: test.studentId || undefined,
      assignedStudents: test.assignedStudents || undefined,
      createdById: test.createdById || undefined,
    });
  }
}

export class PrismaFakeTestResultRepository implements IFakeTestResultRepository {
  constructor(private client: PrismaClient) {}

  async findByStudentId(studentId: string): Promise<FakeTestResultEntity[]> {
    const results = await this.client.fakeTestResult.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });
    return results.map(r => new FakeTestResultEntity(r));
  }

  async create(data: Partial<FakeTestResultEntity>): Promise<FakeTestResultEntity> {
    const result = await this.client.fakeTestResult.create({
      data: {
        studentId: data.studentId!,
        testId: data.testId!,
        subject: data.subject!,
        topic: data.topic!,
        score: data.score!,
        totalQuestions: data.totalQuestions!,
        grade: data.grade!,
        feedback: data.feedback!,
        answers: data.answers!,
      },
    });
    return new FakeTestResultEntity(result);
  }
}

export class PrismaFakeTestAssignmentRepository implements IFakeTestAssignmentRepository {
  constructor(private client: PrismaClient) {}

  async findByStudentId(studentId: string): Promise<FakeTestAssignmentEntity[]> {
    const assignments = await this.client.fakeTestAssignment.findMany({
      where: { studentId },
      include: { test: true },
      orderBy: { createdAt: 'desc' },
    });
    return assignments.map(a => new FakeTestAssignmentEntity({
      ...a,
      completedAt: a.completedAt || undefined,
    }));
  }

  async create(data: Partial<FakeTestAssignmentEntity>): Promise<FakeTestAssignmentEntity> {
    const assignment = await this.client.fakeTestAssignment.create({
      data: {
        testId: data.testId!,
        studentId: data.studentId!,
        assignedById: data.assignedById!,
      },
    });
    return new FakeTestAssignmentEntity({
      ...assignment,
      completedAt: assignment.completedAt || undefined,
    });
  }

  async update(id: string, data: Partial<FakeTestAssignmentEntity>): Promise<FakeTestAssignmentEntity> {
    const assignment = await this.client.fakeTestAssignment.update({
      where: { id },
      data,
    });
    return new FakeTestAssignmentEntity({
      ...assignment,
      completedAt: assignment.completedAt || undefined,
    });
  }
}

// Curriculum Repository Implementations
export class PrismaCurriculumSubjectRepository implements ICurriculumSubjectRepository {
  constructor(private client: PrismaClient) {}

  async findAll(): Promise<CurriculumSubjectEntity[]> {
    const subjects = await this.client.curriculumSubject.findMany({
      orderBy: { code: 'asc' },
    });
    return subjects.map(s => new CurriculumSubjectEntity({ ...s, description: s.description || undefined }));
  }

  async findByCode(code: string): Promise<CurriculumSubjectEntity | null> {
    const subject = await this.client.curriculumSubject.findUnique({ where: { code } });
    return subject ? new CurriculumSubjectEntity({ ...subject, description: subject.description || undefined }) : null;
  }
}

export class PrismaCurriculumGradeLevelRepository implements ICurriculumGradeLevelRepository {
  constructor(private client: PrismaClient) {}

  async findAll(): Promise<CurriculumGradeLevelEntity[]> {
    const levels = await this.client.curriculumGradeLevel.findMany({
      orderBy: { level: 'asc' },
    });
    return levels.map(l => new CurriculumGradeLevelEntity(l));
  }

  async findByLevel(level: number): Promise<CurriculumGradeLevelEntity | null> {
    const gradeLevel = await this.client.curriculumGradeLevel.findFirst({ where: { level } });
    return gradeLevel ? new CurriculumGradeLevelEntity(gradeLevel) : null;
  }
}

export class PrismaCurriculumTopicRepository implements ICurriculumTopicRepository {
  constructor(private client: PrismaClient) {}

  async findAll(gradeLevel?: number, subjectCode?: string): Promise<CurriculumTopicEntity[]> {
    const whereClause: any = {};
    if (gradeLevel) {
      whereClause.gradeLevel = { level: gradeLevel };
    }
    if (subjectCode) {
      whereClause.subject = { code: subjectCode };
    }

    const topics = await this.client.curriculumTopic.findMany({
      where: whereClause,
      include: {
        subject: true,
        gradeLevel: true,
      },
      orderBy: { name: 'asc' },
    });
    return topics.map(t => new CurriculumTopicEntity({
      ...t,
      description: t.description || undefined,
    }));
  }
}

// AI Settings and Student Profile Repository Implementations
export class PrismaAISettingsRepository implements IAISettingsRepository {
  constructor(private client: PrismaClient) {}

  async findByUserId(userId: string): Promise<AISettingsEntity | null> {
    const settings = await this.client.aISettings.findUnique({ where: { userId } });
    return settings ? new AISettingsEntity({
      ...settings,
      ttsModel: settings.ttsModel || undefined,
      sttModel: settings.sttModel || undefined,
      searchApiKey: settings.searchApiKey || undefined,
    }) : null;
  }

  async upsert(userId: string, data: Partial<AISettingsEntity>): Promise<AISettingsEntity> {
    const settings = await this.client.aISettings.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        provider: data.provider || 'openai',
        apiKey: data.apiKey || '',
        baseUrl: data.baseUrl || '',
        model: data.model || 'gpt-3.5-turbo',
        enableWebTTS: data.enableWebTTS || false,
        ttsProvider: data.ttsProvider || 'web',
        ttsModel: data.ttsModel,
        enableWebSTT: data.enableWebSTT || false,
        sttProvider: data.sttProvider || 'web',
        sttModel: data.sttModel,
        enableInternetSearch: data.enableInternetSearch || false,
        searchProvider: data.searchProvider || 'serpapi',
        searchApiKey: data.searchApiKey,
        userLanguage: data.userLanguage || 'sl',
        userCountry: data.userCountry || 'SI',
        educationLevel: data.educationLevel || 'secondary',
        mentorPersona: data.mentorPersona || 'friendly',
      },
    });
    return new AISettingsEntity({
      ...settings,
      ttsModel: settings.ttsModel || undefined,
      sttModel: settings.sttModel || undefined,
      searchApiKey: settings.searchApiKey || undefined,
    });
  }
}

export class PrismaStudentProfileRepository implements IStudentProfileRepository {
  constructor(private client: PrismaClient) {}

  async findByStudentId(studentId: string): Promise<StudentProfileEntity | null> {
    const profile = await this.client.studentProfile.findUnique({ where: { studentId } });
    return profile ? new StudentProfileEntity({
      ...profile,
      gradeLevel: profile.gradeLevel || undefined,
      schoolName: profile.schoolName || undefined,
      interests: profile.interests || undefined,
      lastActivity: profile.lastActivity || undefined,
      aiInsights: profile.aiInsights || undefined,
      lastInsightUpdate: profile.lastInsightUpdate || undefined,
      lastStreakDate: profile.lastStreakDate || undefined,
    }) : null;
  }

  async upsert(studentId: string, data: Partial<StudentProfileEntity>): Promise<StudentProfileEntity> {
    const profile = await this.client.studentProfile.upsert({
      where: { studentId },
      update: data,
      create: {
        studentId,
        gradeLevel: data.gradeLevel,
        schoolName: data.schoolName,
        interests: data.interests,
        totalStudyTime: data.totalStudyTime || 0,
        coursesCompleted: data.coursesCompleted || 0,
        quizzesTaken: data.quizzesTaken || 0,
        totalTestsTaken: data.totalTestsTaken || 0,
        averageScore: data.averageScore || 0.0,
        averageTestScore: data.averageTestScore || 0.0,
        lastActivity: data.lastActivity,
        aiInsights: data.aiInsights,
        lastInsightUpdate: data.lastInsightUpdate,
        totalPoints: data.totalPoints || 0,
        currentStreak: data.currentStreak || 0,
        longestStreak: data.longestStreak || 0,
        lastStreakDate: data.lastStreakDate,
        unlockedThemes: data.unlockedThemes || 'default',
        unlockedFeatures: data.unlockedFeatures || '[]',
      },
    });
    return new StudentProfileEntity({
      ...profile,
      gradeLevel: profile.gradeLevel || undefined,
      schoolName: profile.schoolName || undefined,
      interests: profile.interests || undefined,
      lastActivity: profile.lastActivity || undefined,
      aiInsights: profile.aiInsights || undefined,
      lastInsightUpdate: profile.lastInsightUpdate || undefined,
      lastStreakDate: profile.lastStreakDate || undefined,
    });
  }
}
