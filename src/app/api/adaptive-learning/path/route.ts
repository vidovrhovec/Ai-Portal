import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';
import { workflowErrorLogger } from '@/lib/logger';

const prisma = new PrismaClient();

interface LearningPathStep {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: 'in-progress' | 'completed' | 'recommended';
  courseId?: string;
  estimatedTime: number;
}

/**
 * GET /api/adaptive-learning/path - Return adaptive learning path for user
 */
export async function GET() {
  const session = await auth();

  try {
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Get user's enrollments
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { studentId: session.user.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });

    // Get progress data for enrolled courses
    const courseIds = enrollments.map((e: any) => e.courseId);
    const progressData = await prisma.progress.findMany({
      where: {
        userId: session.user.id,
        courseId: { in: courseIds },
      },
    });

    // Create progress map for quick lookup
    const progressMap = new Map(
      progressData.map(p => [p.courseId, p])
    );

    // Generate adaptive learning path based on enrollments and progress
    const steps: LearningPathStep[] = enrollments.map((enrollment, index) => {
      const progress = progressMap.get(enrollment.courseId);
      const progressValue = progress?.completed ? 100 : 0; // Assuming completed is boolean

      return {
        id: `step-${index + 1}`,
        title: enrollment.course.title,
        description: enrollment.course.description || 'Continue learning',
        progress: progressValue,
        status: progress?.completed ? 'completed' : 'in-progress',
        courseId: enrollment.course.id,
        estimatedTime: 60, // minutes
      };
    });

    // Add next recommended step if user has completed courses
    const completedCourses = steps.filter(step => step.status === 'completed');
    if (completedCourses.length > 0) {
      steps.push({
        id: 'next-recommendation',
        title: 'Explore Advanced Topics',
        description: 'Based on your progress, try these advanced courses',
        progress: 0,
        status: 'recommended',
        estimatedTime: 45,
      });
    }

    return NextResponse.json({
      steps,
      totalSteps: steps.length,
      completedSteps: completedCourses.length,
      userId: session.user.id,
    });
  } catch (error) {
    console.error('Error fetching adaptive learning path:', error);
    workflowErrorLogger.logError(error as Error, {
      operation: 'GET /api/adaptive-learning/path',
      userId: session?.user?.id,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}