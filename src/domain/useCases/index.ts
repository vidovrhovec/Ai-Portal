import { UserEntity, CourseEntity, QuizEntity, GroupEntity, GroupMemberEntity, GroupMessageEntity, AchievementEntity, DailyActivityEntity, FakeTestEntity, FakeTestResultEntity, FakeTestAssignmentEntity, CurriculumTopicEntity, AISettingsEntity, StudentProfileEntity } from '../entities';
import { IDatabaseAdapter, getDatabaseAdapter } from '../../adapters/database';
import { IAIAdapter, AIAdapterFactory } from '../../adapters/ai';
import { DBConfig, AIConfig, GroupWhereClause, MaterialAccessCondition, CurriculumTopicWhereClause, TestAnswers, QuizScoreData, MaterialProgressData, AssignmentAnswers, TestData } from '../../types';
import { GamificationService } from '../../lib/gamification';

// Question interfaces for AI-generated tests
interface GeneratedQuestion {
  type: 'multiple-choice' | 'short-answer' | 'essay';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

interface ParsedAIResponse {
  questions?: GeneratedQuestion[];
  [key: string]: unknown;
}

export class CreateUserUseCase {
  constructor(private dbAdapter: IDatabaseAdapter) {}

  async execute(data: Partial<UserEntity>): Promise<UserEntity> {
    const client = this.dbAdapter.getClient();
    const user = await client.user.create({
      data: {
        email: data.email!,
        name: data.name,
        password: data.password!,
        role: data.role!,
      },
    });
    return new UserEntity({ ...user, name: user.name || undefined, password: user.password || undefined });
  }
}

export class GetCoursesUseCase {
  constructor(private dbAdapter: IDatabaseAdapter) {}

  async execute(): Promise<CourseEntity[]> {
    const client = this.dbAdapter.getClient();
    const courses = await client.course.findMany();
    return courses.map(c => new CourseEntity({ ...c, description: c.description || undefined }));
  }
}

export class GenerateQuizUseCase {
  constructor(private aiAdapter: IAIAdapter, private dbAdapter: IDatabaseAdapter) {}

  async execute(courseId: string, teacherId: string): Promise<QuizEntity> {
    const client = this.dbAdapter.getClient();
    const materials = await client.material.findMany({
      where: { courseId },
    });
    const materialText = materials.map(m => m.content || m.url).join(' ');
    const questions = await this.aiAdapter.generateQuiz(materialText);
    const quiz = await client.quiz.create({
      data: {
        title: 'Generated Quiz',
        questions: {
          create: questions.questions.map(q => ({
            question: q.question,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer,
          })),
        },
        courseId,
        teacherId,
      },
    });
    return new QuizEntity({ ...quiz, score: undefined });
  }
}

export class QueryAIUseCase {
  constructor(private aiAdapter: IAIAdapter) {}

  async execute(query: string): Promise<string> {
    const response = await this.aiAdapter.query({ query });
    return response.response;
  }
}

// Group Management Use Cases
export class CreateGroupUseCase {
  constructor(private dbAdapter: IDatabaseAdapter) {}

  async execute(data: Partial<GroupEntity>): Promise<GroupEntity> {
    const client = this.dbAdapter.getClient();
    const group = await client.group.create({
      data: {
        name: data.name!,
        description: data.description,
        teacherId: data.teacherId!,
      },
    });
    return new GroupEntity({ ...group, description: group.description || undefined });
  }
}

export class GetGroupsUseCase {
  constructor(private dbAdapter: IDatabaseAdapter) {}

  async execute(teacherId?: string, studentId?: string): Promise<GroupEntity[]> {
    const client = this.dbAdapter.getClient();
    const whereClause: GroupWhereClause = {};

    if (teacherId) {
      whereClause.teacherId = teacherId;
    } else if (studentId) {
      // For students, get groups they're members of
      const memberships = await client.groupMember.findMany({
        where: { studentId },
        select: { groupId: true },
      });
      const groupIds = memberships.map(m => m.groupId);
      whereClause.id = { in: groupIds };
    }

    const groups = await client.group.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
    return groups.map(g => new GroupEntity({ ...g, description: g.description || undefined }));
  }
}

export class AddStudentToGroupUseCase {
  constructor(private dbAdapter: IDatabaseAdapter) {}

  async execute(groupId: string, studentId: string): Promise<GroupMemberEntity> {
    const client = this.dbAdapter.getClient();
    const member = await client.groupMember.create({
      data: {
        groupId,
        studentId,
      },
    });
    return new GroupMemberEntity(member);
  }
}

export class SendGroupMessageUseCase {
  constructor(private dbAdapter: IDatabaseAdapter) {}

  async execute(groupId: string, senderId: string, content: string): Promise<GroupMessageEntity> {
    const client = this.dbAdapter.getClient();
    const message = await client.groupMessage.create({
      data: {
        groupId,
        senderId,
        content,
      },
    });
    return new GroupMessageEntity(message);
  }
}

// Gamification Use Cases
export class AwardAchievementUseCase {
  constructor(private dbAdapter: IDatabaseAdapter) {}

  async execute(data: Partial<AchievementEntity>): Promise<AchievementEntity> {
    const client = this.dbAdapter.getClient();
    const achievement = await client.achievement.create({
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

export class UpdateDailyActivityUseCase {
  constructor(private dbAdapter: IDatabaseAdapter) {}

  async execute(data: Partial<DailyActivityEntity>): Promise<DailyActivityEntity> {
    const client = this.dbAdapter.getClient();
    const activity = await client.dailyActivity.upsert({
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

export class GenerateFakeTestUseCase {
  constructor(private aiAdapter: IAIAdapter, private dbAdapter: IDatabaseAdapter) {}

  async execute(studentId: string, subject: string, topic: string, grade: number, difficulty: string) {
    const client = this.dbAdapter.getClient();

    // Get user's AI settings for personalized AI calls
    const user = await client.user.findUnique({ 
      where: { id: studentId }, 
      select: { teacherId: true, role: true } 
    });
    
    let settingsUserId = studentId;
    // If user is a student with a teacher, use teacher's settings
    if (user?.role === 'STUDENT' && user.teacherId) {
      settingsUserId = user.teacherId;
    }

    const aiSettings = await client.aISettings.findUnique({
      where: { userId: settingsUserId },
    });

    // Create AI adapter with user's settings or fallback to environment
    let userAiAdapter = this.aiAdapter;

    const hasValidUserKey = !!(aiSettings?.apiKey && aiSettings.apiKey.trim() !== '' && !aiSettings.apiKey.includes('your-actual') && aiSettings.apiKey !== 'test-api-key');

    if (hasValidUserKey) {
      // Create new AI adapter with user's settings
      const userAiConfig: AIConfig = {
        provider: (aiSettings.provider as 'openai' | 'anthropic' | 'local' | 'custom') || 'openai',
        apiKey: aiSettings.apiKey!,
        baseUrl: aiSettings.baseUrl || 'https://api.openai.com/v1',
        model: aiSettings.model || 'gpt-3.5-turbo',
      };
      console.log('Using user AI config for user', settingsUserId);
      userAiAdapter = AIAdapterFactory.createAdapter(userAiConfig);
    } else {
      // Fallback to environment API key (if present)
      const envApiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
      if (envApiKey && !envApiKey.includes('your-actual') && envApiKey !== 'sk-your-actual-openai-api-key-here') {
        console.log('No user AI key found; using environment API key fallback');
        const envAiConfig: AIConfig = {
          provider: 'openai',
          apiKey: envApiKey,
          baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
          model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        };
        userAiAdapter = AIAdapterFactory.createAdapter(envAiConfig);
      } else {
        throw new Error('No valid AI API key available. Please configure your AI settings.');
      }
    }

    // Get student's materials for context
    const studentUser = await client.user.findUnique({ where: { id: studentId }, select: { teacherId: true } });
    const orConditions: MaterialAccessCondition[] = [{ studentId }];
    if (studentUser?.teacherId) {
      orConditions.push({ teacherId: studentUser.teacherId });
    }
    
    const studentMaterials = await client.material.findMany({
      where: {
        OR: orConditions,
      },
      select: {
        title: true,
        content: true,
        type: true,
      },
    });

    // Get student's previous test performance for personalization
    const previousTests = await client.fakeTestResult.findMany({
      where: {
        studentId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      select: {
        score: true,
        totalQuestions: true,
        subject: true,
        topic: true,
      },
    });

    console.log('Invoking AI generateTest for student', studentId, 'subject', subject, 'topic', topic);
    const TIMEOUT_MS = parseInt(process.env.AI_REQUEST_TIMEOUT_MS || '60000', 10);
    const withTimeout = <T>(p: Promise<T>, ms: number) =>
      new Promise<T>((resolve, reject) => {
        const id = setTimeout(() => reject(new Error(`AI request timed out after ${ms}ms`)), ms);
        p.then((v) => {
          clearTimeout(id);
          resolve(v);
        }).catch((err) => {
          clearTimeout(id);
          reject(err);
        });
      });

    // Use chunked generation to avoid very long single calls that may time out.
    // 1) multiple-choice (5)
    // 2) short-answer (3)
    // 3) essay (2)
    const makePromptSection = (sectionType: string, count: number) => `You are an expert test generator. Produce ${count} ${sectionType} questions for grade ${grade}, subject ${subject}, topic ${topic}. Return a JSON array of questions, each with { "type": "${sectionType}", "question": "...", "options": [..]?, "correctAnswer": "...", "explanation": "..." } only.`;

    const sections: Array<{ type: string; count: number }> = [
      { type: 'multiple-choice', count: 5 },
      { type: 'short-answer', count: 3 },
      { type: 'essay', count: 2 },
    ];

    const combinedQuestions: GeneratedQuestion[] = [];

    // Helper to sanitize and parse AI JSON responses
    const parseAIResponse = (responseText: string, sectionType: string): ParsedAIResponse => {
      let body = responseText.trim();
      
      // Strip markdown code fences more aggressively
      // Remove opening fence: ```json or ``` at start
      body = body.replace(/^```(?:json|JSON)?\s*[\r\n]+/m, '');
      // Remove closing fence: ``` at end
      body = body.replace(/[\r\n]+```\s*$/m, '');
      body = body.trim();
      
      // Try direct parse first
      try {
        return JSON.parse(body);
      } catch {
        // Extract JSON array from text
        const first = body.indexOf('[');
        const last = body.lastIndexOf(']');
        if (first === -1 || last === -1) {
          console.error('No JSON array found in response for', sectionType);
          console.error('Response preview:', responseText.slice(0, 300));
          throw new Error('No JSON array found in response for ' + sectionType);
        }
        let jsonStr = body.slice(first, last + 1);
        
        // Fix common JSON issues
        // Remove trailing commas before ] or }
        jsonStr = jsonStr.replace(/,(\s*[\]}])/g, '$1');
        
        try {
          return JSON.parse(jsonStr);
        } catch (e2) {
          console.error('Failed to parse AI response for', sectionType);
          console.error('Original response (first 500 chars):', responseText.slice(0, 500));
          console.error('After fence removal (first 500 chars):', body.slice(0, 500));
          console.error('Extracted JSON (first 500 chars):', jsonStr.slice(0, 500));
          console.error('Parse error:', e2);
          throw new Error(`Invalid JSON from AI for ${sectionType}: ${e2 instanceof Error ? e2.message : String(e2)}`);
        }
      }
    };

    for (const sec of sections) {
      const secPrompt = makePromptSection(sec.type, sec.count) + `\nPrevious performance: ${JSON.stringify(previousTests)}\nMaterials: ${JSON.stringify(studentMaterials)}`;
      try {
        console.log('Invoking AI for section', sec.type);
        const sectionResp = await withTimeout(userAiAdapter.query({ query: secPrompt }), TIMEOUT_MS);
        const parsed = parseAIResponse(sectionResp.response, sec.type);
        if (Array.isArray(parsed)) {
          combinedQuestions.push(...parsed.map((q) => ({ ...q, type: sec.type })));
        } else {
          throw new Error('AI section response not an array for ' + sec.type);
        }
        console.log('Section', sec.type, 'received', parsed.length, 'items');
      } catch (aiErr) {
        console.error('AI section generation failed for', sec.type, aiErr);
        const errMsg = aiErr instanceof Error ? aiErr.message : String(aiErr);
        
        // If JSON parsing failed (not timeout), retry with stricter prompt and smaller model
        if (errMsg.includes('Invalid JSON') || errMsg.includes('Expected')) {
          console.log('JSON parse error detected. Retrying with stricter prompt and smaller model...');
          try {
            const strictPrompt = `You are a test generator. Return ONLY a valid JSON array with exactly ${sec.count} ${sec.type} questions for grade ${grade}, subject "${subject}", topic "${topic}". 
CRITICAL: Return ONLY the JSON array, no markdown, no explanations, no extra text.
Each question must have: "type", "question", "options" (array), "correctAnswer", "explanation".
Example format:
[{"type":"${sec.type}","question":"...","options":["A","B","C","D"],"correctAnswer":"A","explanation":"..."}]`;
            
            const smallerConfig: AIConfig = {
              provider: (aiSettings?.provider as 'openai' | 'anthropic' | 'local' | 'custom') || 'openai',
              apiKey: aiSettings?.apiKey || undefined,
              baseUrl: aiSettings?.baseUrl || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
              model: 'gpt-3.5-turbo',
            };
            const smallerAdapter = AIAdapterFactory.createAdapter(smallerConfig);
            const retryTimeout = Math.max(TIMEOUT_MS * 1.5, 90000);
            const retryResp = await withTimeout(smallerAdapter.query({ query: strictPrompt }), retryTimeout);
            const parsed = parseAIResponse(retryResp.response, sec.type);
            if (Array.isArray(parsed.questions)) {
              combinedQuestions.push(...parsed.questions.map((q: GeneratedQuestion) => ({ ...q, type: sec.type as GeneratedQuestion['type'] })));
            }
            console.log('Retry with strict prompt succeeded for', sec.type, 'received', parsed.length, 'items');
            continue;
          } catch (retryErr) {
            console.error('Strict prompt retry failed:', retryErr);
            // Fall through to timeout handling below
          }
        }
        
        if (errMsg.includes('timed out')) {
          // Attempt single fallback with environment key if available
          console.log('Section timed out. Attempting fallback with environment adapter...');
          const envApiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
          // First try fallback by switching to a smaller/faster model but keeping the same user API key
          try {
            const smallerModel = 'gpt-3.5-turbo';
            console.log('Attempting fallback with same API key but smaller model:', smallerModel);
            const smallerConfig: AIConfig = {
              provider: (aiSettings?.provider as 'openai' | 'anthropic' | 'local' | 'custom') || 'openai',
              apiKey: aiSettings?.apiKey || undefined,
              baseUrl: aiSettings?.baseUrl || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
              model: smallerModel,
            };
            const smallerAdapter = AIAdapterFactory.createAdapter(smallerConfig);
            const fallbackTimeout = Math.max(TIMEOUT_MS * 2, 120000);
            const sectionResp2 = await withTimeout(smallerAdapter.query({ query: secPrompt }), fallbackTimeout);
            const parsed2 = parseAIResponse(sectionResp2.response, sec.type);
            if (Array.isArray(parsed2.questions)) {
              combinedQuestions.push(...parsed2.questions.map((q: GeneratedQuestion) => ({ ...q, type: sec.type as GeneratedQuestion['type'] })));
            }
            console.log('Smaller-model fallback section', sec.type, 'received', parsed2.length, 'items');
            continue;
          } catch (smallerErr) {
            console.error('Smaller-model fallback failed:', smallerErr);
          }

          // If smaller-model fallback failed, try environment API key fallback (if available)
          if (envApiKey && !envApiKey.includes('your-actual') && envApiKey !== 'sk-your-actual-openai-api-key-here') {
            const envAiConfig: AIConfig = {
              provider: 'openai',
              apiKey: envApiKey,
              baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
              model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
            };
            const fallbackAdapter = AIAdapterFactory.createAdapter(envAiConfig);
            try {
              const fallbackTimeout = Math.max(TIMEOUT_MS * 2, 120000);
              const sectionResp2 = await withTimeout(fallbackAdapter.query({ query: secPrompt }), fallbackTimeout);
              const parsed2 = parseAIResponse(sectionResp2.response, sec.type);
              if (Array.isArray(parsed2.questions)) {
                combinedQuestions.push(...parsed2.questions.map((q: GeneratedQuestion) => ({ ...q, type: sec.type as GeneratedQuestion['type'] })));
              }
              console.log('Fallback section', sec.type, 'received', parsed2.length, 'items');
              continue;
            } catch (fallbackErr) {
              console.error('Fallback section failed for', sec.type, fallbackErr);
              throw fallbackErr;
            }
          }
        }
        throw aiErr;
      }
    }

    // Build testData from combinedQuestions
    const testData = {
      title: `Generated test for ${subject} - ${topic}`,
      subject,
      grade,
      questions: combinedQuestions,
    } as TestData;

    console.log('Combined test questions length:', testData.questions.length);

    // Save test to database
    const test = await client.fakeTest.create({
      data: {
        studentId,
        subject,
        topic,
        grade,
        difficulty,
        questions: JSON.stringify(testData.questions),
      },
    });

    // Create assignment for the student (self-assigned)
    await client.fakeTestAssignment.create({
      data: {
        testId: test.id,
        studentId,
        assignedById: studentId, // Self-assigned
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

export class CreateFakeTestUseCase {
  constructor(private dbAdapter: IDatabaseAdapter) {}

  async execute(data: Partial<FakeTestEntity>): Promise<FakeTestEntity> {
    const client = this.dbAdapter.getClient();
    const test = await client.fakeTest.create({
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

export class AssignFakeTestUseCase {
  constructor(private dbAdapter: IDatabaseAdapter) {}

  async execute(testId: string, studentId: string, assignedById: string): Promise<FakeTestAssignmentEntity> {
    const client = this.dbAdapter.getClient();
    const assignment = await client.fakeTestAssignment.create({
      data: {
        testId,
        studentId,
        assignedById,
      },
    });
    return new FakeTestAssignmentEntity({
      ...assignment,
      completedAt: assignment.completedAt || undefined,
    });
  }
}

export class SubmitFakeTestResultUseCase {
  constructor(private dbAdapter: IDatabaseAdapter) {}

  async execute(data: Partial<FakeTestResultEntity>): Promise<FakeTestResultEntity> {
    const client = this.dbAdapter.getClient();
    const result = await client.fakeTestResult.create({
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

export class GradeAndSubmitFakeTestUseCase {
  constructor(private aiAdapter: IAIAdapter, private dbAdapter: IDatabaseAdapter) {}

  async execute(studentId: string, testId: string, answers: TestAnswers) {
    const client = this.dbAdapter.getClient();

    // Get the test
    const test = await client.fakeTest.findUnique({
      where: { id: testId },
    });

    if (!test || test.studentId !== studentId) {
      throw new Error('Test not found');
    }

    // Grade the test using AI
    const prompt = `You are an expert test grader for Slovenian curriculum. Grade the student's answers objectively and provide constructive feedback.

Test details:
Subject: ${test.subject}
Topic: ${test.topic}
Grade Level: ${test.grade}
Questions: ${JSON.stringify(test.questions, null, 2)}
Student Answers: ${JSON.stringify(answers, null, 2)}

Grade each answer and provide:
1. Score (number of correct answers)
2. Total questions
3. Slovenian school grade (1-5 scale)
4. Detailed feedback in Slovenian
5. Individual answer analysis

Return in this exact JSON format:
{
  "score": 7,
  "totalQuestions": 10,
  "grade": "4",
  "feedback": "Detailed feedback in Slovenian about performance...",
  "answers": [
    {
      "questionId": "question-id",
      "answer": "student's answer",
      "isCorrect": true,
      "feedback": "Specific feedback for this question"
    }
  ]
}`;

    const gradingResult = await this.aiAdapter.gradeTest(prompt);

    // Save test result
    const result = await client.fakeTestResult.create({
      data: {
        studentId,
        testId,
        subject: test.subject,
        topic: test.topic,
        score: gradingResult.score,
        totalQuestions: gradingResult.totalQuestions,
        grade: Math.max(1, Math.min(5, Math.round((gradingResult.score / gradingResult.totalQuestions) * 4) + 1)).toString(), // Convert to Slovenian grade 1-5
        feedback: gradingResult.feedback,
        answers: JSON.stringify(gradingResult.detailedResults || []),
      },
    });

    // Update student statistics
    const existingProfile = await client.studentProfile.findUnique({
      where: { studentId },
      select: { totalTestsTaken: true, averageTestScore: true },
    });

    const newTotalTests = (existingProfile?.totalTestsTaken || 0) + 1;
    const currentAvg = existingProfile?.averageTestScore || 0;
    const newScoreRatio = gradingResult.score / gradingResult.totalQuestions;
    const newAverage = ((currentAvg * (newTotalTests - 1)) + newScoreRatio) / newTotalTests;

    await client.studentProfile.upsert({
      where: { studentId },
      update: {
        totalTestsTaken: newTotalTests,
        averageTestScore: newAverage,
      },
      create: {
        studentId,
        totalTestsTaken: 1,
        averageTestScore: newScoreRatio,
      },
    });

    return new FakeTestResultEntity(result);
  }
}
export class GetCurriculumTopicsUseCase {
  constructor(private dbAdapter: IDatabaseAdapter) {}

  async execute(gradeLevel?: number, subjectCode?: string): Promise<CurriculumTopicEntity[]> {
    const client = this.dbAdapter.getClient();
    const whereClause: CurriculumTopicWhereClause = {};
    if (gradeLevel) {
      whereClause.gradeLevel = { level: gradeLevel };
    }
    if (subjectCode) {
      whereClause.subject = { code: subjectCode };
    }

    const topics = await client.curriculumTopic.findMany({
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

export class GetGamificationStatsUseCase {
  constructor(private dbAdapter: IDatabaseAdapter) {}

  async execute(studentId: string) {
    const client = this.dbAdapter.getClient();
    const profile = await client.studentProfile.findUnique({
      where: { studentId },
      select: {
        totalPoints: true,
        currentStreak: true,
        longestStreak: true,
        lastStreakDate: true,
        unlockedThemes: true,
        unlockedFeatures: true
      }
    });

    const achievements = await client.achievement.findMany({
      where: { studentId },
      orderBy: { unlockedAt: 'desc' }
    });

    // Get recent daily activities (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivities = await client.dailyActivity.findMany({
      where: {
        studentId,
        date: { gte: sevenDaysAgo }
      },
      orderBy: { date: 'desc' }
    });

    return {
      profile,
      achievements,
      recentActivities,
      availableUnlocks: await this.getAvailableUnlocks(profile?.totalPoints || 0)
    };
  }

  private async getAvailableUnlocks(points: number) {
    // This is a simplified version; in real implementation, you'd have a config
    const unlocks: string[] = [];
    if (points >= 100) unlocks.push('theme1');
    if (points >= 500) unlocks.push('theme2');
    return unlocks;
  }
}

export class UpdateAISettingsUseCase {
  constructor(private dbAdapter: IDatabaseAdapter) {}

  async execute(userId: string, data: Partial<AISettingsEntity>): Promise<AISettingsEntity> {
    const client = this.dbAdapter.getClient();
    const settings = await client.aISettings.upsert({
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

export class UpdateStudentProfileUseCase {
  constructor(private dbAdapter: IDatabaseAdapter) {}

  async execute(studentId: string, data: Partial<StudentProfileEntity>): Promise<StudentProfileEntity> {
    const client = this.dbAdapter.getClient();
    const profile = await client.studentProfile.upsert({
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

interface QuestionResult {
  questionId: string;
  answer: string;
  isCorrect: boolean | null;
  status: 'graded' | 'analyzing';
  type: string;
  question?: string;
  correctAnswer?: string;
  aiFeedback?: string;
}

export class SubmitAssignedFakeTestUseCase {
  constructor(private dbAdapter: IDatabaseAdapter, private aiAdapter?: IAIAdapter) {}

  async execute(studentId: string, assignmentId: string, answers: AssignmentAnswers) {
    const client = this.dbAdapter.getClient();

    // Get the assignment
    const assignment = await client.fakeTestAssignment.findUnique({
      where: { id: assignmentId },
      include: { test: true },
    });

    if (!assignment || assignment.studentId !== studentId || assignment.completedAt) {
      throw new Error('Invalid assignment');
    }

    const questions = JSON.parse(assignment.test.questions);
    let immediateScore = 0;
    let aiAnalysisCount = 0;
    const questionResults: QuestionResult[] = [];

    // Process each question
    for (const question of questions) {
      const userAnswer = answers[question.id];

      if (question.type === 'multiple-choice') {
        // Immediate grading for multiple choice
        const isCorrect = userAnswer?.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim();
        if (isCorrect) immediateScore++;

        questionResults.push({
          questionId: question.id,
          answer: userAnswer || '',
          isCorrect,
          status: 'graded', // Immediate result
          type: question.type,
        });
      } else {
        // Mark open-ended questions for AI analysis
        aiAnalysisCount++;
        questionResults.push({
          questionId: question.id,
          answer: userAnswer || '',
          isCorrect: null, // Will be determined by AI
          status: 'analyzing', // AI analysis pending
          type: question.type,
          question: question.question,
          correctAnswer: question.correctAnswer,
        });
      }
    }

    // Calculate preliminary grade based on immediate results
    const immediatePercentage = questions.length > 0 ? (immediateScore / questions.length) * 100 : 0;
    const preliminaryGrade = immediatePercentage >= 90 ? '5' : immediatePercentage >= 80 ? '4' :
                           immediatePercentage >= 70 ? '3' : immediatePercentage >= 60 ? '2' : '1';

    // Update assignment as completed
    await client.fakeTestAssignment.update({
      where: { id: assignmentId },
      data: { completedAt: new Date() },
    });

    // Save preliminary result
    const result = await client.fakeTestResult.create({
      data: {
        studentId,
        testId: assignment.testId,
        subject: assignment.test.subject,
        topic: assignment.test.topic,
        score: immediateScore,
        totalQuestions: questions.length,
        grade: preliminaryGrade,
        feedback: aiAnalysisCount > 0 ?
          `Prejeti rezultati za ${questions.length - aiAnalysisCount} vprašanj. AI analizira ${aiAnalysisCount} odprtih vprašanj...` :
          'Test zaključen uspešno!',
        answers: JSON.stringify(questionResults),
      },
    });

    // Award gamification points for completion
    await GamificationService.recordActivity(studentId, 'quiz_completed', { quizId: assignment.testId });

    // Start AI analysis for open-ended questions in background
    if (aiAnalysisCount > 0 && this.aiAdapter) {
      const testEntity = new FakeTestEntity({
        ...assignment.test,
        studentId: assignment.test.studentId || undefined,
        assignedStudents: assignment.test.assignedStudents || undefined,
        createdById: assignment.test.createdById || undefined,
      });
      this.processAIAnalysis(result.id, questionResults, testEntity).catch(error => {
        console.error('AI analysis failed:', error);
      });
    }

    return {
      result: new FakeTestResultEntity(result),
      hasPendingAnalysis: aiAnalysisCount > 0,
      immediateResults: questionResults.filter(q => q.status === 'graded'),
      pendingAnalysis: questionResults.filter(q => q.status === 'analyzing'),
    };
  }

  private async processAIAnalysis(resultId: string, questionResults: QuestionResult[], test: FakeTestEntity) {
    const client = this.dbAdapter!.getClient();

    try {
      let updatedScore = 0;
      const updatedResults: QuestionResult[] = [];

      for (const questionResult of questionResults) {
        if (questionResult.status === 'analyzing') {
          // AI grading for open-ended questions
          const aiGrade = await this.gradeOpenEndedQuestion(questionResult, test);
          questionResult.isCorrect = aiGrade.isCorrect;
          questionResult.status = 'graded';
          questionResult.aiFeedback = aiGrade.feedback;

          if (aiGrade.isCorrect) updatedScore++;
        }
        updatedResults.push(questionResult);
      }

      // Calculate final grade
      const finalPercentage = (updatedScore / questionResults.length) * 100;
      const finalGrade = finalPercentage >= 90 ? '5' : finalPercentage >= 80 ? '4' :
                        finalPercentage >= 70 ? '3' : finalPercentage >= 60 ? '2' : '1';

      // Update the result with final AI-analyzed answers
      await client.fakeTestResult.update({
        where: { id: resultId },
        data: {
          score: updatedScore,
          grade: finalGrade,
          feedback: 'AI analiza zaključena. Preglej podrobne rezultate.',
          answers: JSON.stringify(updatedResults),
        },
      });

      console.log(`AI analysis completed for test result ${resultId}`);
    } catch (error) {
      console.error('AI analysis processing failed:', error);
      // Mark as failed but don't break the flow
      await client.fakeTestResult.update({
        where: { id: resultId },
        data: {
          feedback: 'AI analiza ni uspela. Rezultati temeljijo na takojšnjih ocenah.',
        },
      });
    }
  }

  private async gradeOpenEndedQuestion(questionResult: QuestionResult, test: FakeTestEntity) {
    const prompt = `You are an expert test grader for Slovenian curriculum. Evaluate this student's answer for accuracy and completeness.

Test Details:
Subject: ${test.subject}
Topic: ${test.topic}
Grade Level: ${test.grade}

Question: ${questionResult.question}
Expected Answer: ${questionResult.correctAnswer}
Student's Answer: ${questionResult.answer}

Evaluate if the student's answer is correct. Consider:
- Factual accuracy
- Completeness of the answer
- Understanding of the concept
- Different wording but same meaning (especially for Slovenian language)

Return ONLY a JSON object:
{
  "isCorrect": true/false,
  "feedback": "Brief explanation in Slovenian about why the answer is correct/incorrect"
}`;

    try {
      const response = await this.aiAdapter!.query({ query: prompt });
      const parsed = JSON.parse(response.response.trim());

      return {
        isCorrect: parsed.isCorrect,
        feedback: parsed.feedback,
      };
    } catch (error) {
      console.error('AI grading failed:', error);
      // Fallback: assume correct if answer exists
      return {
        isCorrect: questionResult.answer && questionResult.answer.trim().length > 0,
        feedback: 'AI ocenjevanje ni uspelo. Odgovor je bil ocenjen kot pravilen.',
      };
    }
  }
}

export class GetKnowledgeHeatmapUseCase {
  constructor(private dbAdapter: IDatabaseAdapter) {}

  async execute(studentId: string) {
    const client = this.dbAdapter.getClient();

    // Get student's grade level
    const studentProfile = await client.studentProfile.findUnique({
      where: { studentId },
      select: { gradeLevel: true }
    });

    if (!studentProfile?.gradeLevel) {
      throw new Error('Student profile not found');
    }

    const gradeLevel = studentProfile.gradeLevel;

    // Get student's courses and performance data
    const courses = await client.course.findMany({
      include: {
        materials: true,
        quizzes: {
          include: {
            submissions: {
              where: { studentId }
            }
          }
        }
      }
    });

    // Get student's material access
    const studentMaterials = await client.material.findMany({
      where: {
        studentId
      }
    });

    // Calculate knowledge levels for each course
    const knowledgeMap = courses.map(course => {
      const courseQuizzes = course.quizzes.flatMap(quiz => quiz.submissions);
      const courseMaterials: MaterialProgressData[] = studentMaterials
        .filter(mat => mat.courseId === course.id)
        .map(mat => ({ id: mat.id, completed: true }));

      const courseScore = this.calculateCourseScore(courseQuizzes, courseMaterials, course.materials.length);

      return {
        id: course.id,
        name: course.title,
        code: course.title.substring(0, 3).toUpperCase(),
        score: courseScore,
        level: this.getKnowledgeLevel(courseScore),
        totalMaterials: course.materials.length,
        accessedMaterials: courseMaterials.length,
        totalQuizzes: course.quizzes.length,
        completedQuizzes: courseQuizzes.length,
        averageQuizScore: courseQuizzes.length > 0 ? courseQuizzes.reduce((sum, sub) => sum + (sub.score || 0), 0) / courseQuizzes.length : 0,
        topics: [] // Placeholder for future curriculum integration
      };
    });

    // Calculate overall statistics
    const totalCourses = courses.length;
    const completedCourses = knowledgeMap.filter(c => c.completedQuizzes > 0 || c.accessedMaterials > 0).length;
    const averageScore = knowledgeMap.length > 0 ? knowledgeMap.reduce((sum, course) => sum + course.score, 0) / knowledgeMap.length : 0;

    return {
      gradeLevel,
      knowledgeMap,
      statistics: {
        totalCourses,
        completedCourses,
        completionRate: totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0,
        averageScore: Math.round(averageScore),
        strongestCourse: knowledgeMap.reduce((best, course) => course.score > best.score ? course : best, knowledgeMap[0] || { name: 'None', score: 0 }),
        weakestCourse: knowledgeMap.reduce((worst, course) => course.score < worst.score ? course : worst, knowledgeMap[0] || { name: 'None', score: 100 })
      }
    };
  }

  private calculateCourseScore(quizzes: QuizScoreData[], materials: MaterialProgressData[], totalMaterials: number): number {
    let score = 0;

    // Quiz performance (60% weight)
    if (quizzes.length > 0) {
      const avgQuizScore = quizzes.reduce((sum, q) => sum + (q.score || 0), 0) / quizzes.length;
      score += avgQuizScore * 0.6;
    }

    // Material engagement (40% weight)
    const materialScore = Math.min((materials.length / Math.max(totalMaterials, 1)) * 40, 40);
    score += materialScore;

    return Math.min(Math.max(score, 0), 100);
  }

  private getKnowledgeLevel(score: number): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    if (score >= 85) return 'expert';
    if (score >= 70) return 'advanced';
    if (score >= 50) return 'intermediate';
    return 'beginner';
  }
}

export class JoinGroupUseCase {
  constructor(private dbAdapter: IDatabaseAdapter) {}

  async execute(studentId: string, inviteCode: string) {
    const client = this.dbAdapter.getClient();

    // Find the invite
    const invite = await client.groupInvite.findFirst({
      where: {
        code: inviteCode,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        group: true,
      },
    });

    if (!invite || !invite.groupId) {
      throw new Error('Invalid or expired invite code');
    }

    // Check if student is already a member
    const existingMember = await client.groupMember.findFirst({
      where: {
        groupId: invite.groupId,
        studentId,
      },
    });

    if (existingMember) {
      throw new Error('You are already a member of this group');
    }

    // Add student to group
    const member = await client.groupMember.create({
      data: {
        groupId: invite.groupId,
        studentId,
      },
    });

    // Mark invite as used
    await client.groupInvite.update({
      where: { id: invite.id },
      data: { isActive: false },
    });

    // Create group activity
    await client.groupActivity.create({
      data: {
        groupId: invite.groupId,
        userId: studentId,
        activityType: 'joined',
      },
    });

    return new GroupMemberEntity(member);
  }
}

export class GetAISettingsUseCase {
  constructor(private dbAdapter: IDatabaseAdapter) {}

  async execute(userId: string, requestingUserId: string, requestingUserRole: string) {
    const client = this.dbAdapter.getClient();

    // Users can only access their own settings, or teachers can access student settings
    if (requestingUserId !== userId && requestingUserRole !== 'TEACHER') {
      throw new Error('Forbidden');
    }

    // Check if user is a student with a teacher
    const user = await client.user.findUnique({
      where: { id: userId },
      select: { role: true, teacherId: true },
    });

    let settingsUserId = userId;

    // If user is a student with a teacher, use teacher's settings
    if (user?.role === 'STUDENT' && user.teacherId) {
      settingsUserId = user.teacherId;
    }

    const settings = await client.aISettings.findUnique({
      where: { userId: settingsUserId },
    });

    if (!settings) {
      // Return default settings
      return {
        provider: 'openai',
        apiKey: '',
        baseUrl: 'https://api.openai.com/v1',
        model: '',
        enableWebTTS: false,
        enableWebSTT: false,
        ttsProvider: 'web',
        ttsModel: '',
        sttProvider: 'web',
        sttModel: '',
        enableInternetSearch: false,
        searchProvider: 'serpapi',
        searchApiKey: '',
        userLanguage: 'sl',
        userCountry: 'SI',
        educationLevel: 'secondary',
        mentorPersona: 'friendly',
      };
    }

    return new AISettingsEntity({
      ...settings,
      ttsModel: settings.ttsModel || undefined,
      sttModel: settings.sttModel || undefined,
      searchApiKey: settings.searchApiKey || undefined,
    });
  }
}

export class GenerateAndAssignFakeTestUseCase {
  constructor(private aiAdapter: IAIAdapter, private dbAdapter: IDatabaseAdapter) {}

  async execute(teacherId: string, subject: string, topic: string, grade: number, difficulty: string, studentIds: string[]) {
    const client = this.dbAdapter.getClient();

    // Get teacher's AI settings for personalized AI calls
    const aiSettings = await client.aISettings.findUnique({
      where: { userId: teacherId },
    });

    // Create AI adapter with teacher's settings or fallback to environment
    let teacherAiAdapter = this.aiAdapter;
    if (aiSettings?.apiKey && aiSettings.apiKey.trim() !== '' && !aiSettings.apiKey.includes('your-actual') && aiSettings.apiKey !== 'test-api-key') {
      // Create new AI adapter with teacher's settings
      const teacherAiConfig: AIConfig = {
        provider: (aiSettings.provider as 'openai' | 'anthropic' | 'local') || 'openai',
        apiKey: aiSettings.apiKey,
        baseUrl: aiSettings.baseUrl || 'https://api.openai.com/v1',
        model: aiSettings.model || 'gpt-3.5-turbo',
      };
      teacherAiAdapter = AIAdapterFactory.createAdapter(teacherAiConfig);
    } else {
      // Check if environment has a valid API key
      const envApiKey = process.env.OPENAI_API_KEY;
      if (envApiKey && !envApiKey.includes('your-actual') && envApiKey !== 'sk-your-actual-openai-api-key-here') {
        // Use environment API key as fallback
        console.log('Using environment API key as fallback for teacher without valid AI settings');
      } else {
        throw new Error('No valid AI API key available. Please configure your AI settings.');
      }
    }

    // Get selected students' profiles and performance data
    const students = await client.user.findMany({
      where: {
        id: { in: studentIds },
        teacherId,
      },
      include: {
        studentProfile: true,
        fakeTestResults: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            score: true,
            totalQuestions: true,
            subject: true,
            topic: true,
            grade: true,
          },
        },
      },
    });

    if (students.length === 0) {
      throw new Error('No valid students found');
    }

    // Get course materials for context
    const courseMaterials = await client.material.findMany({
      where: {
        teacherId,
      },
      select: {
        title: true,
        content: true,
        type: true,
      },
    });

    // Calculate average performance for personalization
    const studentStats = students.map(student => ({
      id: student.id,
      name: student.name,
      gradeLevel: student.studentProfile?.gradeLevel,
      averageScore: student.studentProfile?.averageTestScore || 0,
      totalTests: student.studentProfile?.totalTestsTaken || 0,
      recentPerformance: student.fakeTestResults.slice(0, 5),
    }));

    // Generate personalized test using AI
    const prompt = `You are an expert test generator for Slovenian curriculum. Create personalized practice tests for multiple students based on their individual performance history and curriculum level.

Test details:
Subject: ${subject}
Topic: ${topic}
Grade Level: ${grade}
Difficulty: ${difficulty}

Student Performance Data: ${JSON.stringify(studentStats, null, 2)}
Available Materials: ${JSON.stringify(courseMaterials, null, 2)}

Create a test with 10 questions that includes:
- 5 multiple choice questions (4 options each)
- 3 short answer questions
- 2 essay questions

The test should be appropriate for the grade level and adapted to the students' average performance. Make questions progressively more challenging based on the group's performance data.

Return the test in this exact JSON format:
{
  "questions": [
    {
      "type": "multiple-choice",
      "question": "Question text adapted to student level",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": "A) Option 1",
      "explanation": "Explanation why this is correct"
    },
    {
      "type": "short-answer",
      "question": "Question text",
      "correctAnswer": "Expected answer",
      "explanation": "Explanation"
    },
    {
      "type": "essay",
      "question": "Question text",
      "correctAnswer": "Sample good answer structure",
      "explanation": "Grading criteria"
    }
  ]
}`;

    const testData = await teacherAiAdapter.generateTest(prompt);

    // Save test to database
    const test = await client.fakeTest.create({
      data: {
        subject,
        topic,
        grade,
        difficulty,
        questions: JSON.stringify(testData.questions),
        assignedStudents: JSON.stringify(studentIds),
        createdById: teacherId,
      },
    });

    // Create assignments for each student
    const assignments = studentIds.map((studentId: string) => ({
      testId: test.id,
      studentId,
      assignedById: teacherId,
    }));

    await client.fakeTestAssignment.createMany({
      data: assignments,
    });

    return {
      test: new FakeTestEntity({
        ...test,
        studentId: undefined,
        assignedStudents: test.assignedStudents || undefined,
        createdById: test.createdById || undefined,
      }),
      assignedTo: students.length,
    };
  }
}
export class UseCaseFactory {
  private dbAdapter: IDatabaseAdapter;
  private aiAdapter: IAIAdapter;

  constructor(dbConfig: DBConfig, aiConfig: AIConfig) {
    this.dbAdapter = getDatabaseAdapter(dbConfig);
    this.aiAdapter = AIAdapterFactory.createAdapter(aiConfig);
  }

  createUserUseCase(): CreateUserUseCase {
    return new CreateUserUseCase(this.dbAdapter);
  }

  getCoursesUseCase(): GetCoursesUseCase {
    return new GetCoursesUseCase(this.dbAdapter);
  }

  generateQuizUseCase(): GenerateQuizUseCase {
    return new GenerateQuizUseCase(this.aiAdapter, this.dbAdapter);
  }

  queryAIUseCase(): QueryAIUseCase {
    return new QueryAIUseCase(this.aiAdapter);
  }

  // Group management use cases
  createGroupUseCase(): CreateGroupUseCase {
    return new CreateGroupUseCase(this.dbAdapter);
  }

  getGroupsUseCase(): GetGroupsUseCase {
    return new GetGroupsUseCase(this.dbAdapter);
  }

  addStudentToGroupUseCase(): AddStudentToGroupUseCase {
    return new AddStudentToGroupUseCase(this.dbAdapter);
  }

  sendGroupMessageUseCase(): SendGroupMessageUseCase {
    return new SendGroupMessageUseCase(this.dbAdapter);
  }

  // Gamification use cases
  awardAchievementUseCase(): AwardAchievementUseCase {
    return new AwardAchievementUseCase(this.dbAdapter);
  }

  updateDailyActivityUseCase(): UpdateDailyActivityUseCase {
    return new UpdateDailyActivityUseCase(this.dbAdapter);
  }

  getGamificationStatsUseCase(): GetGamificationStatsUseCase {
    return new GetGamificationStatsUseCase(this.dbAdapter);
  }

  // Fake test use cases
  createFakeTestUseCase(): CreateFakeTestUseCase {
    return new CreateFakeTestUseCase(this.dbAdapter);
  }

  assignFakeTestUseCase(): AssignFakeTestUseCase {
    return new AssignFakeTestUseCase(this.dbAdapter);
  }

  submitFakeTestResultUseCase(): SubmitFakeTestResultUseCase {
    return new SubmitFakeTestResultUseCase(this.dbAdapter);
  }

  generateFakeTestUseCase(): GenerateFakeTestUseCase {
    return new GenerateFakeTestUseCase(this.aiAdapter, this.dbAdapter);
  }

  gradeAndSubmitFakeTestUseCase(): GradeAndSubmitFakeTestUseCase {
    return new GradeAndSubmitFakeTestUseCase(this.aiAdapter, this.dbAdapter);
  }

  submitAssignedFakeTestUseCase(): SubmitAssignedFakeTestUseCase {
    return new SubmitAssignedFakeTestUseCase(this.dbAdapter, this.aiAdapter);
  }

  generateAndAssignFakeTestUseCase(): GenerateAndAssignFakeTestUseCase {
    return new GenerateAndAssignFakeTestUseCase(this.aiAdapter, this.dbAdapter);
  }

  getKnowledgeHeatmapUseCase(): GetKnowledgeHeatmapUseCase {
    return new GetKnowledgeHeatmapUseCase(this.dbAdapter);
  }

  joinGroupUseCase(): JoinGroupUseCase {
    return new JoinGroupUseCase(this.dbAdapter);
  }

  getAISettingsUseCase(): GetAISettingsUseCase {
    return new GetAISettingsUseCase(this.dbAdapter);
  }

  // Curriculum use cases
  getCurriculumTopicsUseCase(): GetCurriculumTopicsUseCase {
    return new GetCurriculumTopicsUseCase(this.dbAdapter);
  }

  // AI Settings and Student Profile use cases
  updateAISettingsUseCase(): UpdateAISettingsUseCase {
    return new UpdateAISettingsUseCase(this.dbAdapter);
  }

  updateStudentProfileUseCase(): UpdateStudentProfileUseCase {
    return new UpdateStudentProfileUseCase(this.dbAdapter);
  }
}
