import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/students/assigned-tests - Get assigned tests for student
 */
export async function GET() {
  const session = await auth();

  try {
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tests = await prisma.fakeTestAssignment.findMany({
      where: {
        studentId: session.user.id,
      },
      include: {
        test: true,
      },
    });

    return NextResponse.json(tests);
  } catch (error) {
    console.error('Error fetching assigned tests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
