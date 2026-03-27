import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';
import { workflowErrorLogger } from '@/lib/logger';

const prisma = new PrismaClient();

/**
 * GET /api/analytics/progress - Return progress analytics data for charts
 */
export async function GET(request: NextRequest) {
  const session = await auth();

  try {
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Get period from query params (default to 30d)
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get daily activities for the period
    const dailyActivities = await prisma.dailyActivity.findMany({
      where: {
        studentId: session.user.id,
        date: {
          gte: startDate,
          lte: now,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Get user analytics
    const userAnalytics = await prisma.userAnalytics.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    // Get student profile for additional stats
    const studentProfile = await prisma.studentProfile.findUnique({
      where: {
        studentId: session.user.id,
      },
    });

    // Generate dates array for the period
    const dates: string[] = [];
    const points: number[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= now) {
      const dateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      dates.push(dateStr);

      // Find activity for this date
      const activity = dailyActivities.find(activity => {
        const activityDate = new Date(activity.date).toISOString().split('T')[0];
        return activityDate === dateStr;
      });

      points.push(activity?.pointsEarned || 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate analytics
    const totalPoints = userAnalytics?.totalPoints || studentProfile?.totalPoints || 0;
    const currentStreak = userAnalytics?.currentStreak || studentProfile?.currentStreak || 0;
    const averageScore = userAnalytics?.averageScore || studentProfile?.averageScore || 0;

    return NextResponse.json({
      dates,
      points,
      currentStreak,
      totalPoints,
      averageScore,
      period,
    });
  } catch (error) {
    console.error('Error fetching analytics progress:', error);
    workflowErrorLogger.logError(error as Error, {
      operation: 'GET /api/analytics/progress',
      userId: session?.user?.id,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}