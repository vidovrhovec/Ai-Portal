import { UseCaseFactory } from '../domain/useCases';
import { PrismaGroupRepository, PrismaGroupMemberRepository, PrismaGroupMessageRepository, PrismaAchievementRepository, PrismaDailyActivityRepository, PrismaFakeTestRepository, PrismaFakeTestResultRepository, PrismaFakeTestAssignmentRepository, PrismaCurriculumSubjectRepository, PrismaCurriculumGradeLevelRepository, PrismaCurriculumTopicRepository, PrismaAISettingsRepository, PrismaStudentProfileRepository } from '../infrastructure/repositories';
import { getDatabaseAdapter } from '../adapters/database';
import { DBConfig, AIConfig } from '../types';

// Service Container for Dependency Injection
export class ServiceContainer {
  private static instance: ServiceContainer;
  private useCaseFactory: UseCaseFactory;

  private constructor() {
    const dbConfig: DBConfig = {
      type: 'sqlite',
      url: process.env.DATABASE_URL || 'file:./dev.db',
    };

    const aiConfig: AIConfig = {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY || '',
      baseUrl: process.env.OPENAI_BASE_URL,
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    };

    this.useCaseFactory = new UseCaseFactory(dbConfig, aiConfig);
  }

  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  getUseCaseFactory(): UseCaseFactory {
    return this.useCaseFactory;
  }

  // Repository instances
  getGroupRepository() {
    const dbAdapter = getDatabaseAdapter({
      type: 'sqlite',
      url: process.env.DATABASE_URL || 'file:./dev.db',
    });
    return new PrismaGroupRepository(dbAdapter.getClient());
  }

  getGroupMemberRepository() {
    const dbAdapter = getDatabaseAdapter({
      type: 'sqlite',
      url: process.env.DATABASE_URL || 'file:./dev.db',
    });
    return new PrismaGroupMemberRepository(dbAdapter.getClient());
  }

  getGroupMessageRepository() {
    const dbAdapter = getDatabaseAdapter({
      type: 'sqlite',
      url: process.env.DATABASE_URL || 'file:./dev.db',
    });
    return new PrismaGroupMessageRepository(dbAdapter.getClient());
  }

  getAchievementRepository() {
    const dbAdapter = getDatabaseAdapter({
      type: 'sqlite',
      url: process.env.DATABASE_URL || 'file:./dev.db',
    });
    return new PrismaAchievementRepository(dbAdapter.getClient());
  }

  getDailyActivityRepository() {
    const dbAdapter = getDatabaseAdapter({
      type: 'sqlite',
      url: process.env.DATABASE_URL || 'file:./dev.db',
    });
    return new PrismaDailyActivityRepository(dbAdapter.getClient());
  }

  getFakeTestRepository() {
    const dbAdapter = getDatabaseAdapter({
      type: 'sqlite',
      url: process.env.DATABASE_URL || 'file:./dev.db',
    });
    return new PrismaFakeTestRepository(dbAdapter.getClient());
  }

  getFakeTestResultRepository() {
    const dbAdapter = getDatabaseAdapter({
      type: 'sqlite',
      url: process.env.DATABASE_URL || 'file:./dev.db',
    });
    return new PrismaFakeTestResultRepository(dbAdapter.getClient());
  }

  getFakeTestAssignmentRepository() {
    const dbAdapter = getDatabaseAdapter({
      type: 'sqlite',
      url: process.env.DATABASE_URL || 'file:./dev.db',
    });
    return new PrismaFakeTestAssignmentRepository(dbAdapter.getClient());
  }

  getCurriculumSubjectRepository() {
    const dbAdapter = getDatabaseAdapter({
      type: 'sqlite',
      url: process.env.DATABASE_URL || 'file:./dev.db',
    });
    return new PrismaCurriculumSubjectRepository(dbAdapter.getClient());
  }

  getCurriculumGradeLevelRepository() {
    const dbAdapter = getDatabaseAdapter({
      type: 'sqlite',
      url: process.env.DATABASE_URL || 'file:./dev.db',
    });
    return new PrismaCurriculumGradeLevelRepository(dbAdapter.getClient());
  }

  getCurriculumTopicRepository() {
    const dbAdapter = getDatabaseAdapter({
      type: 'sqlite',
      url: process.env.DATABASE_URL || 'file:./dev.db',
    });
    return new PrismaCurriculumTopicRepository(dbAdapter.getClient());
  }

  getAISettingsRepository() {
    const dbAdapter = getDatabaseAdapter({
      type: 'sqlite',
      url: process.env.DATABASE_URL || 'file:./dev.db',
    });
    return new PrismaAISettingsRepository(dbAdapter.getClient());
  }

  getStudentProfileRepository() {
    const dbAdapter = getDatabaseAdapter({
      type: 'sqlite',
      url: process.env.DATABASE_URL || 'file:./dev.db',
    });
    return new PrismaStudentProfileRepository(dbAdapter.getClient());
  }
}

// Export singleton instance
export const serviceContainer = ServiceContainer.getInstance();