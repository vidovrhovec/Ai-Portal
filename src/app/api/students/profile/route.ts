import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';
import { workflowErrorLogger } from '@/lib/logger';

const prisma = new PrismaClient();

/**
 * GET /api/students/profile - Return student profile
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

    const profile = await prisma.studentProfile.findUnique({
      where: { studentId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching student profile:', error);
    workflowErrorLogger.logError(error as Error, {
      operation: 'GET /api/students/profile',
      userId: session?.user?.id,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}