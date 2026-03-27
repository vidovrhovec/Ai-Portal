'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Target, Award } from 'lucide-react';

interface CourseNode {
  id: string;
  name: string;
  code: string;
  score: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  totalMaterials: number;
  accessedMaterials: number;
  totalQuizzes: number;
  completedQuizzes: number;
  averageQuizScore: number;
  topics: unknown[]; // Placeholder for future
}

interface KnowledgeHeatmapProps {
  studentId: string;
}

export function KnowledgeHeatmap({ studentId }: KnowledgeHeatmapProps) {
  const { data: heatmapData, isLoading, error } = useQuery({
    queryKey: ['knowledge-heatmap', studentId],
    queryFn: async () => {
      const response = await fetch('/api/students/knowledge-heatmap');
      if (!response.ok) throw new Error('Failed to fetch knowledge data');
      return response.json();
    },
    enabled: !!studentId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Knowledge Tree
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Building your knowledge tree...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !heatmapData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Knowledge Tree
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600">Unable to load knowledge visualization</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { knowledgeMap, statistics } = heatmapData;

  const getNodeColor = (level: string, hasActivity: boolean) => {
    if (!hasActivity) return '#e5e7eb'; // gray-300

    switch (level) {
      case 'expert': return '#fbbf24'; // amber-400 (gold)
      case 'advanced': return '#34d399'; // emerald-400 (green)
      case 'intermediate': return '#fbbf24'; // amber-400 (yellow)
      case 'beginner': return '#f87171'; // red-400
      default: return '#e5e7eb';
    }
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'expert': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'beginner': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Knowledge Overview
          </CardTitle>
          <CardDescription>
            Your learning progress across all subjects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{statistics.totalCourses}</div>
              <div className="text-sm text-gray-600">Courses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{statistics.completedCourses}</div>
              <div className="text-sm text-gray-600">Active Courses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{Math.round(statistics.completionRate)}%</div>
              <div className="text-sm text-gray-600">Activity Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{statistics.averageScore}%</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(statistics.completionRate)}%</span>
            </div>
            <Progress value={statistics.completionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Tree Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Knowledge Tree
          </CardTitle>
          <CardDescription>
            Your skill tree - light up the branches by mastering topics! 🌟
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {knowledgeMap.map((course: CourseNode, courseIndex: number) => (
              <div key={course.id} className="relative">
                {/* Course Node */}
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
                    style={{ backgroundColor: getNodeColor(course.level, course.completedQuizzes > 0 || course.accessedMaterials > 0) }}
                  >
                    {course.code}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{course.name}</h3>
                      <Badge className={getLevelBadgeColor(course.level)}>
                        {course.level}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{course.completedQuizzes}/{course.totalQuizzes} quizzes</span>
                      <span>{course.accessedMaterials}/{course.totalMaterials} materials</span>
                      <span>Score: {Math.round(course.score)}%</span>
                      <Progress value={course.score} className="w-20 h-1" />
                    </div>
                  </div>
                </div>

                {/* Course separator */}
                {courseIndex < knowledgeMap.length - 1 && (
                  <div className="border-b border-gray-200 my-6"></div>
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Knowledge Levels
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-400"></div>
                <span>Beginner (0-49%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                <span>Intermediate (50-69%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-400"></div>
                <span>Advanced (70-84%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-400 border-2 border-yellow-600"></div>
                <span>Expert (85%+)</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              💡 Tip: Complete quizzes and explore materials to light up your knowledge tree! Future updates will show detailed topic breakdowns.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}