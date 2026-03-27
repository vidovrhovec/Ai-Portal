import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/flashcards/review - Review a flashcard
 */
export async function POST(request: Request) {
  const session = await auth();

  try {
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { flashcardId, quality } = body;

    // Update flashcard review using spaced repetition algorithm
    const flashcard = await prisma.flashcardReview.upsert({
      where: { flashcardId },
      update: {
        lastReviewed: new Date(),
        quality: quality || 3,
        interval: 1, // TODO: Implement proper spaced repetition
      },
      create: {
        flashcardId,
        nextReview: new Date(),
        lastReviewed: new Date(),
        quality: quality || 3,
      },
    });

    return NextResponse.json(flashcard);
  } catch (error) {
    console.error('Error reviewing flashcard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
