import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/students/fake-tests/generate - Generate a fake test
 */
export async function POST(request: Request) {
  const session = await auth();

  try {
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subject, grade, difficulty } = body;

    // TODO: Integrate with AI to generate test questions
    const questionsData = [
      {
        type: 'short-answer',
        question: 'Primer vprašanja',
      },
    ];

    const test = await prisma.fakeTest.create({
      data: {
        subject: subject || 'General',
        topic: body.topic || 'General Topic',
        grade: grade || 8,
        difficulty: difficulty || 'medium',
        questions: JSON.stringify(questionsData),
        userId: session.user.id, // Use userId instead of createdById
      },
    });

    return NextResponse.json(test, { status: 201 });
  } catch (error) {
    console.error('Error generating fake test:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
