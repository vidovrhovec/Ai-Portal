import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { workflowErrorLogger } from '@/lib/logger';

const prisma = new PrismaClient();

/**
 * GET /api/admin/users - Get all users (Admin only)
 */
export async function GET() {
  const session = await auth();

  try {

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Note: We don't return password or sensitive data
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    workflowErrorLogger.logError(error as Error, {
      operation: 'GET /api/admin/users',
      userId: session?.user?.id,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users - Create a new user (Admin only)
 */
export async function POST(request: NextRequest) {
  const session = await auth();

  try {

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { name, email, role, password } = await request.json();

    // Validate required fields
    if (!name || !email || !role || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, role, password' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: ADMIN, TEACHER, STUDENT, PARENT' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    workflowErrorLogger.logError(error as Error, {
      operation: 'POST /api/admin/users',
      userId: session?.user?.id,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}