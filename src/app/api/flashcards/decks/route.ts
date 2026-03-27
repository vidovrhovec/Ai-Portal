import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/flashcards/decks - Get user's flashcard decks
 */
export async function GET() {
  const session = await auth();

  try {
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decks = await prisma.flashcardDeck.findMany({
      where: {
        studentId: session.user.id,
      },
    });

    return NextResponse.json(decks);
  } catch (error) {
    console.error('Error fetching flashcard decks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/flashcards/decks - Create a new flashcard deck
 */
export async function POST(request: Request) {
  const session = await auth();

  try {
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, subject } = body;

    const deck = await prisma.flashcardDeck.create({
      data: {
        title,
        subject: subject || 'General',
        studentId: session.user.id,
        materialId: 'default', // Required field
      },
    });

    return NextResponse.json(deck, { status: 201 });
  } catch (error) {
    console.error('Error creating flashcard deck:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
