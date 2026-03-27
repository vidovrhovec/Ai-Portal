/**
 * Gamification Service Module
 * 
 * This module handles all gamification logic for the learning platform, including:
 * - Activity tracking and point calculation
 * - Streak management for consecutive learning days
 * - Achievement unlocking based on milestones
 * - Feature unlock system using accumulated points
 * - Leaderboard calculations and rankings
 * 
 * The gamification system encourages consistent learning through rewards,
 * progress visualization, and social comparison features.
 */

import { prisma } from '@/lib/prisma';

export class GamificationService {
  /**
   * Record daily activity and update streaks/points
   */
  static async recordActivity(
    studentId: string,
    activityType: 'quiz_completed' | 'material_read' | 'study_time',
    metadata?: { quizId?: string; materialId?: string; minutes?: number }
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get or create daily activity record
    let dailyActivity = await prisma.dailyActivity.findUnique({
      where: {
        studentId_date: {
          studentId,
          date: today
        }
      }
    });

    if (!dailyActivity) {
      dailyActivity = await prisma.dailyActivity.create({
        data: {
          studentId,
          date: today,
          quizzesCompleted: 0,
          materialsRead: 0,
          pointsEarned: 0,
          streakMaintained: false
        }
      });
    }

    // Update activity based on type
    let pointsEarned = 0;
    const updateData: Record<string, { increment: number }> = {};

    switch (activityType) {
      case 'quiz_completed':
        updateData.quizzesCompleted = { increment: 1 };
        pointsEarned = 10; // Points for completing a quiz
        break;
      case 'material_read':
        updateData.materialsRead = { increment: 1 };
        pointsEarned = 5; // Points for reading material
        break;
      case 'study_time':
        if (metadata?.minutes) {
          updateData.studyTimeMinutes = { increment: metadata.minutes };
          pointsEarned = Math.floor(metadata.minutes / 10); // 1 point per 10 minutes
        }
        break;
    }

    // Update daily activity
    updateData.pointsEarned = { increment: pointsEarned };
    await prisma.dailyActivity.update({
      where: { id: dailyActivity.id },
      data: updateData
    });

    // Update student profile
    await this.updateStudentProfile(studentId, pointsEarned);

    // Check and update streak
    await this.updateStreak(studentId);

    // Check for achievements
    await this.checkAchievements(studentId);

    return { pointsEarned };
  }

  /**
   * Update student profile with points and stats
   */
  private static async updateStudentProfile(studentId: string, pointsEarned: number) {
    await prisma.studentProfile.upsert({
      where: { studentId },
      update: {
        totalPoints: { increment: pointsEarned },
        lastActivity: new Date()
      },
      create: {
        studentId,
        totalPoints: pointsEarned,
        lastActivity: new Date()
      }
    });
  }

  /**
   * Update study streak
   */
  private static async updateStreak(studentId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get today's and yesterday's activities
    const [todayActivity, yesterdayActivity] = await Promise.all([
      prisma.dailyActivity.findUnique({
        where: {
          studentId_date: {
            studentId,
            date: today
          }
        }
      }),
      prisma.dailyActivity.findUnique({
        where: {
          studentId_date: {
            studentId,
            date: yesterday
          }
        }
      })
    ]);

    // Check if streak should be maintained
    const hasActivityToday = todayActivity &&
      (todayActivity.quizzesCompleted > 0 || todayActivity.materialsRead > 0);

    if (!hasActivityToday) return;

    // Get current streak info
    const profile = await prisma.studentProfile.findUnique({
      where: { studentId },
      select: { currentStreak: true, longestStreak: true, lastStreakDate: true }
    });

    if (!profile) return;

    let newStreak = 1;
    let streakMaintained = false;

    // Check if yesterday had activity (maintaining streak)
    if (yesterdayActivity && yesterdayActivity.streakMaintained) {
      const lastStreakDate = profile.lastStreakDate;
      if (lastStreakDate && lastStreakDate >= yesterday) {
        newStreak = profile.currentStreak + 1;
        streakMaintained = true;
      }
    }

    // Update streak in profile
    await prisma.studentProfile.update({
      where: { studentId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(profile.longestStreak, newStreak),
        lastStreakDate: today
      }
    });

    // Mark today's activity as streak-maintaining
    if (todayActivity) {
      await prisma.dailyActivity.update({
        where: { id: todayActivity.id },
        data: { streakMaintained: streakMaintained || newStreak > 1 }
      });
    }

    // Award streak bonus points
    if (newStreak > 1) {
      const streakBonus = Math.min(newStreak * 2, 20); // Max 20 bonus points
      await this.updateStudentProfile(studentId, streakBonus);
    }
  }

  /**
   * Check and award achievements
   */
  private static async checkAchievements(studentId: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { studentId },
      include: { student: true }
    });

    if (!profile) return;

    const achievements: Array<{
      type: string;
      title: string;
      description: string;
      icon: string;
      points: number;
    }> = [];

    // Streak achievements
    if (profile.currentStreak >= 7 && !(await this.hasAchievement(studentId, 'streak', 'Week Warrior'))) {
      achievements.push({
        type: 'streak',
        title: 'Week Warrior',
        description: 'Maintain a 7-day study streak!',
        icon: '🔥',
        points: 50
      });
    }

    if (profile.longestStreak >= 30 && !(await this.hasAchievement(studentId, 'streak', 'Monthly Master'))) {
      achievements.push({
        type: 'streak',
        title: 'Monthly Master',
        description: 'Achieve a 30-day study streak!',
        icon: '👑',
        points: 200
      });
    }

    // Points achievements
    if (profile.totalPoints >= 100 && !(await this.hasAchievement(studentId, 'points', 'Century Club'))) {
      achievements.push({
        type: 'points',
        title: 'Century Club',
        description: 'Earn 100 points!',
        icon: '💯',
        points: 25
      });
    }

    if (profile.totalPoints >= 1000 && !(await this.hasAchievement(studentId, 'points', 'Point Master'))) {
      achievements.push({
        type: 'points',
        title: 'Point Master',
        description: 'Earn 1000 points!',
        icon: '⭐',
        points: 100
      });
    }

    // Create achievements
    for (const achievement of achievements) {
      await prisma.achievement.create({
        data: {
          studentId,
          ...achievement
        }
      });

      // Award achievement points
      await this.updateStudentProfile(studentId, achievement.points);
    }
  }

  /**
   * Check if student already has an achievement
   */
  private static async hasAchievement(studentId: string, type: string, title: string): Promise<boolean> {
    const achievement = await prisma.achievement.findUnique({
      where: {
        studentId_type_title: {
          studentId,
          type,
          title
        }
      }
    });
    return !!achievement;
  }

  /**
   * Get student's gamification stats
   */
  static async getGamificationStats(studentId: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { studentId },
      select: {
        totalPoints: true,
        currentStreak: true,
        longestStreak: true,
        lastStreakDate: true,
        unlockedThemes: true,
        unlockedFeatures: true
      }
    });

    const achievements = await prisma.achievement.findMany({
      where: { studentId },
      orderBy: { unlockedAt: 'desc' }
    });

    // Get recent daily activities (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivities = await prisma.dailyActivity.findMany({
      where: {
        studentId,
        date: { gte: sevenDaysAgo }
      },
      orderBy: { date: 'desc' }
    });

    return {
      profile,
      achievements,
      recentActivities,
      availableUnlocks: await this.getAvailableUnlocks(profile?.totalPoints || 0)
    };
  }

  /**
   * Get available feature unlocks based on points
   */
  private static async getAvailableUnlocks(currentPoints: number) {
    const unlocks = await prisma.featureUnlock.findMany({
      where: {
        isEnabled: true,
        pointsRequired: { lte: currentPoints }
      },
      orderBy: { pointsRequired: 'asc' }
    });

    return unlocks;
  }

  /**
   * Unlock a feature for a student
   */
  static async unlockFeature(studentId: string, featureName: string) {
    const unlock = await prisma.featureUnlock.findUnique({
      where: { name: featureName }
    });

    if (!unlock) throw new Error('Feature not found');

    const profile = await prisma.studentProfile.findUnique({
      where: { studentId },
      select: { totalPoints: true, unlockedFeatures: true }
    });

    if (!profile || profile.totalPoints < unlock.pointsRequired) {
      throw new Error('Insufficient points');
    }

    const unlockedFeatures = JSON.parse(profile.unlockedFeatures || '[]');
    if (unlockedFeatures.includes(featureName)) {
      throw new Error('Feature already unlocked');
    }

    unlockedFeatures.push(featureName);

    await prisma.studentProfile.update({
      where: { studentId },
      data: {
        unlockedFeatures: JSON.stringify(unlockedFeatures)
      }
    });

    return unlock;
  }
}