import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/groups/invites - Get created invites (as creator)
 */
export async function GET() {
  const session = await auth();

  try {
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invites = await prisma.groupInvite.findMany({
      where: {
        creatorId: session.user.id,
      },
    });

    return NextResponse.json(invites);
  } catch (error) {
    console.error('Error fetching group invites:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/groups/invites - Create a group invite
 */
export async function POST(request: Request) {
  const session = await auth();

  try {
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { groupId, title, description, maxMembers, expiresAt } = body;

    // Generate invite code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const invite = await prisma.groupInvite.create({
      data: {
        code,
        groupId,
        creatorId: session.user.id,
        title: title || 'Study Group Invite',
        description: description || '',
        maxMembers: maxMembers || 10,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json(invite, { status: 201 });
  } catch (error) {
    console.error('Error creating group invite:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
