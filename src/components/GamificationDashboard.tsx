'use client';

/**
 * GamificationDashboard Component
 * 
 * Displays student's gamification progress including achievements, streaks, points,
 * and available feature unlocks. Provides an interactive interface for tracking
 * learning progress and unlocking new platform features through earned rewards.
 * 
 * Features:
 * - Achievement tracking with badges and progress bars
 * - Streak counters for consecutive learning days
 * - Points system with leaderboards
 * - Feature unlock system based on accumulated points
 * - Interactive dialogs for unlocking new capabilities
 * 
 * @param studentId - The ID of the student whose gamification data to display
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Flame,
  Trophy,
  Star,
  Gift,
  Calendar,
  Award,
  Zap,
  Lock,
  Unlock
} from 'lucide-react';
import { useState } from 'react';

/**
 * Props for the GamificationDashboard component
 */
interface GamificationDashboardProps {
  /** The unique identifier of the student */
  studentId: string;
}

interface Unlock {
  name: string;
  displayName: string;
  description: string;
  pointsRequired: number;
}

interface Achievement {
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

interface Activity {
  date: string;
  type: string;
  points: number;
}

export function GamificationDashboard({ studentId }: GamificationDashboardProps) {
  const queryClient = useQueryClient();
  const [selectedUnlock, setSelectedUnlock] = useState<Unlock | null>(null);

  const { data: gamificationData, isLoading } = useQuery({
    queryKey: ['gamification', studentId],
    queryFn: async () => {
      const response = await fetch('/api/students/gamification');
      if (!response.ok) throw new Error('Failed to fetch gamification data');
      return response.json();
    },
    enabled: !!studentId,
  });

  const unlockMutation = useMutation({
    mutationFn: async (featureName: string) => {
      const response = await fetch('/api/students/unlock-feature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featureName }),
      });
      if (!response.ok) throw new Error('Failed to unlock feature');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification', studentId] });
      setSelectedUnlock(null);
    },
  });

  if (isLoading || !gamificationData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Achievement Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading your achievements...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { profile, achievements, recentActivities, availableUnlocks } = gamificationData;
  const unlockedFeatures = JSON.parse(profile?.unlockedFeatures || '[]');

  const getStreakStatus = () => {
    const today = new Date().toDateString();
    const lastActivity = profile?.lastStreakDate ? new Date(profile.lastStreakDate).toDateString() : null;
    return today === lastActivity;
  };

  const streakActive = getStreakStatus();

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Study Streak */}
        <Card className={`relative overflow-hidden ${streakActive ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' : 'bg-gradient-to-r from-gray-100 to-gray-200'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${streakActive ? 'text-orange-100' : 'text-gray-600'}`}>Study Streak</p>
                <p className="text-3xl font-bold">{profile?.currentStreak || 0}</p>
                <p className={`text-xs ${streakActive ? 'text-orange-200' : 'text-gray-500'}`}>
                  Best: {profile?.longestStreak || 0} days
                </p>
              </div>
              <Flame className={`w-8 h-8 ${streakActive ? 'text-orange-200' : 'text-gray-400'}`} />
            </div>
            {streakActive && (
              <div className="mt-2 text-xs text-orange-200">
                🔥 Keep it up! Study today to maintain your streak!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Points */}
        <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Total Points</p>
                <p className="text-3xl font-bold">{profile?.totalPoints || 0}</p>
                <p className="text-xs text-yellow-200">Earn more by studying!</p>
              </div>
              <Star className="w-8 h-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        {/* Achievements Unlocked */}
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Achievements</p>
                <p className="text-3xl font-bold">{achievements?.length || 0}</p>
                <p className="text-xs text-purple-200">Keep unlocking!</p>
              </div>
              <Trophy className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        {/* Today's Activity */}
        <Card className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Today&apos;s Activity</p>
                <p className="text-3xl font-bold">
                  {recentActivities?.find((a: Activity) => {
                    const today = new Date().toDateString();
                    const activityDate = new Date(a.date).toDateString();
                    return today === activityDate;
                  })?.pointsEarned || 0}
                </p>
                <p className="text-xs text-green-200">Points earned today</p>
              </div>
              <Zap className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Recent Achievements
          </CardTitle>
          <CardDescription>
            Your latest unlocked achievements and milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          {achievements && achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.slice(0, 6).map((achievement: Achievement) => (
                <div key={`${achievement.name}-${achievement.description}`} className="flex items-center gap-3 p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{achievement.name}</h4>
                    <p className="text-xs text-gray-600">{achievement.description}</p>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      Unlocked
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No achievements yet. Start studying to unlock your first achievement!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Unlocks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Feature Unlocks
          </CardTitle>
          <CardDescription>
            Unlock special features and AI assistants with your points
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableUnlocks?.map((unlock: Unlock) => {
              const isUnlocked = unlockedFeatures.includes(unlock.name);
              return (
                <div key={unlock.name} className={`p-4 border rounded-lg ${isUnlocked ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl">🔓</div>
                    {isUnlocked ? (
                      <Unlock className="w-5 h-5 text-green-600" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{unlock.displayName}</h4>
                  <p className="text-xs text-gray-600 mb-3">{unlock.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant={isUnlocked ? "default" : "secondary"} className="text-xs">
                      {unlock.pointsRequired} pts
                    </Badge>
                    {!isUnlocked && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => setSelectedUnlock(unlock)}
                            disabled={profile?.totalPoints < unlock.pointsRequired}
                          >
                            Unlock
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Unlock {unlock.displayName}</DialogTitle>
                            <DialogDescription>
                              {unlock.description}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setSelectedUnlock(null)}>
                              Cancel
                            </Button>
                            <Button
                              onClick={() => unlockMutation.mutate(unlock.name)}
                              disabled={unlockMutation.isPending}
                            >
                              {unlockMutation.isPending ? 'Unlocking...' : `Unlock (${unlock.pointsRequired} pts)`}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Activity Calendar (Last 7 days) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Activity Calendar
          </CardTitle>
          <CardDescription>
            Your study activity over the last 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (6 - i));
              const dateStr = date.toDateString();

              const activity = recentActivities?.find((a: Activity) => {
                const activityDate = new Date(a.date).toDateString();
                return activityDate === dateStr;
              });

              const hasActivity = activity && (activity.quizzesCompleted > 0 || activity.materialsRead > 0);
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <div key={i} className={`p-3 rounded-lg text-center ${hasActivity ? 'bg-green-100 border-green-300' : 'bg-gray-100'} ${isToday ? 'ring-2 ring-blue-400' : ''}`}>
                  <div className="text-xs text-gray-600 mb-1">
                    {date.toLocaleDateString('en', { weekday: 'short' })}
                  </div>
                  <div className="text-sm font-semibold">
                    {hasActivity ? '✅' : '❌'}
                  </div>
                  {activity && (
                    <div className="text-xs text-gray-500 mt-1">
                      +{activity.pointsEarned}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}