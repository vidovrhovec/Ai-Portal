import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { workflowErrorLogger } from '@/lib/logger';

const prisma = new PrismaClient();

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PUT /api/admin/users/[id] - Update a user (Admin only)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const paramsResolved = await params;

  try {

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = paramsResolved;
    const { name, email, role, password } = await request.json();

    // Validate required fields
    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, role' },
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

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if email is already taken by another user
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already taken by another user' },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData: {
      name: string;
      email: string;
      role: string;
      password?: string;
    } = {
      name,
      email,
      role,
    };

    // Hash new password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    workflowErrorLogger.logError(error as Error, {
      operation: 'PUT /api/admin/users/[id]',
      userId: session?.user?.id,
      targetUserId: paramsResolved.id,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id] - Delete a user (Admin only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const paramsResolved = await params;

  try {

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = paramsResolved;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deleting the current admin user
    if (session.user.id === id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    workflowErrorLogger.logError(error as Error, {
      operation: 'DELETE /api/admin/users/[id]',
      userId: session?.user?.id,
      targetUserId: paramsResolved.id,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}