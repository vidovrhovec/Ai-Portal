import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';
import { workflowErrorLogger } from '@/lib/logger';
import { TauriAIService } from '@/lib/tauri-ai';

const prisma = new PrismaClient();

/**
 * GET /api/ai/chat - Return user's AI chat message history
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

    // Get all AI chat messages for the user
    const messages = await prisma.aIChatMessage.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({
      messages,
      total: messages.length,
    });
  } catch (error) {
    console.error('Error fetching AI chat history:', error);
    workflowErrorLogger.logError(error as Error, {
      operation: 'GET /api/ai/chat',
      userId: session?.user?.id,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/chat - Send a message to AI and get response
 */
export async function POST(request: Request) {
  const session = await auth();

  try {
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { messages, model = 'llama2' } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Save user message to database
    const userMessage = await prisma.aIChatMessage.create({
      data: {
        userId: session.user.id,
        role: 'user',
        content: messages[messages.length - 1].content,
      },
    });

    // Get AI response using Tauri service
    const aiService = new TauriAIService();
    const aiResponse = await aiService.chat(messages, model);

    // Save AI response to database
    const aiMessage = await prisma.aIChatMessage.create({
      data: {
        userId: session.user.id,
        role: 'assistant',
        content: aiResponse,
      },
    });

    return NextResponse.json({
      userMessage,
      aiMessage,
      response: aiResponse,
    });
  } catch (error) {
    console.error('Error processing AI chat:', error);
    workflowErrorLogger.logError(error as Error, {
      operation: 'POST /api/ai/chat',
      userId: session?.user?.id,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ai/chat - Delete all user's AI chat messages
 */
export async function DELETE() {
  const session = await auth();

  try {
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Delete all AI chat messages for the user
    const result = await prisma.aIChatMessage.deleteMany({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: 'Chat history deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting AI chat history:', error);
    workflowErrorLogger.logError(error as Error, {
      operation: 'DELETE /api/ai/chat',
      userId: session?.user?.id,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}