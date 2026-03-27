import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/groups/canvases/[canvasId]/elements - Get canvas elements
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ canvasId: string }> }
) {
  const { canvasId } = await params;
  const session = await auth();

  try {
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const elements = await prisma.canvasElement.findMany({
      where: {
        canvasId: canvasId,
      },
    });

    return NextResponse.json(elements);
  } catch (error) {
    console.error('Error fetching canvas elements:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/groups/canvases/[canvasId]/elements - Add element to canvas
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ canvasId: string }> }
) {
  const { canvasId } = await params;
  const session = await auth();

  try {
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, positionX, positionY, width, height, text } = body;

    const element = await prisma.canvasElement.create({
      data: {
        canvasId: canvasId,
        type: type || 'text',
        positionX: positionX || 0,
        positionY: positionY || 0,
        width: width || 100,
        height: height || 100,
        content: text || '',
        creatorId: session.user.id,
      },
    });

    return NextResponse.json(element, { status: 201 });
  } catch (error) {
    console.error('Error creating canvas element:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
