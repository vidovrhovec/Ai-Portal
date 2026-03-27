import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';
import { workflowErrorLogger } from '@/lib/logger';

const prisma = new PrismaClient();

/**
 * GET /api/enrollments - Return user enrollments
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

    const enrollments = await prisma.courseEnrollment.findMany({
      where: { studentId: session.user.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            teacherId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

    return NextResponse.json(enrollments);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    workflowErrorLogger.logError(error as Error, {
      operation: 'GET /api/enrollments',
      userId: session?.user?.id,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}