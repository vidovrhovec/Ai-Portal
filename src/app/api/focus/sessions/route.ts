import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/focus/sessions - Start a new focus session
 */
export async function POST(request: Request) {
  const session = await auth();

  try {
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { duration, music } = body;

    const focusSession = await prisma.focusSession.create({
      data: {
        userId: session.user.id,
        duration: duration || 25, // Default 25 minutes
        musicType: music ? 'enabled' : 'disabled',
        pomodoroCycles: 1,
        completedAt: new Date(),
      },
    });

    return NextResponse.json(focusSession, { status: 201 });
  } catch (error) {
    console.error('Error creating focus session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/focus/sessions - Get focus sessions
 */
export async function GET() {
  const session = await auth();

  try {
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await prisma.focusSession.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching focus sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
