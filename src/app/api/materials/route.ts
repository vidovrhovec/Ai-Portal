import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/materials - Get learning materials
 */
export async function GET() {
  const session = await auth();

  try {
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const materials = await prisma.material.findMany({
      where: {
        OR: [
          { studentId: session.user.id },
          { teacherId: session.user.id },
          { courseId: { in: await getAccessibleCourseIds(session.user.id) } },
        ],
      },
    });

    return NextResponse.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/materials - Create a new material
 */
export async function POST(request: Request) {
  const session = await auth();

  try {
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, courseId } = body;

    const material = await prisma.material.create({
      data: {
        title,
        type: 'text',
        content: content || '',
        courseId: courseId || null,
        teacherId: session.user.id,
        studentId: session.user.id,
      },
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error('Error creating material:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getAccessibleCourseIds(userId: string): Promise<string[]> {
  const enrollments = await prisma.courseEnrollment.findMany({
    where: { studentId: userId },
    select: { courseId: true },
  });
  return enrollments.map((e) => e.courseId);
}
