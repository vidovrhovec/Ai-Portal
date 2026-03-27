import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Users, Target, BookOpen, AlertTriangle } from 'lucide-react';

interface AdvancedAnalyticsSectionProps {
  // No props needed for now
}

export const AdvancedAnalyticsSection: React.FC<AdvancedAnalyticsSectionProps> = () => {
  // Mock data - in real implementation, this would come from API
  const curriculumGoals = [
    { subject: 'Mathematics', goal: 85, current: 78, students: 45 },
    { subject: 'Science', goal: 80, current: 82, students: 42 },
    { subject: 'History', goal: 75, current: 70, students: 38 },
    { subject: 'English', goal: 90, current: 88, students: 50 },
  ];

  const strugglingStudents = [
    { name: 'John Doe', subject: 'Mathematics', score: 65, issues: ['Algebra', 'Geometry'] },
    { name: 'Jane Smith', subject: 'History', score: 58, issues: ['World War II', 'Ancient Civilizations'] },
    { name: 'Bob Johnson', subject: 'Science', score: 62, issues: ['Chemistry', 'Physics'] },
  ];

  const questionDifficulty = [
    { topic: 'Basic Algebra', avgScore: 85, attempts: 120 },
    { topic: 'Advanced Calculus', avgScore: 45, attempts: 80 },
    { topic: 'Organic Chemistry', avgScore: 72, attempts: 95 },
    { topic: 'World Literature', avgScore: 78, attempts: 110 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">Deep insights into student performance and curriculum alignment</p>
        </div>
        <Button variant="outline">
          <TrendingUp className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Curriculum Goals vs Current Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5" />
            Curriculum Goals vs Performance
          </CardTitle>
          <CardDescription>
            Compare current student performance against established curriculum goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {curriculumGoals.map((goal, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{goal.subject}</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant={goal.current >= goal.goal ? 'default' : 'destructive'}>
                      {goal.current >= goal.goal ? (
                        <TrendingUp className="mr-1 h-3 w-3" />
                      ) : (
                        <TrendingDown className="mr-1 h-3 w-3" />
                      )}
                      {goal.current}%
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Goal: {goal.goal}% ({goal.students} students)
                    </span>
                  </div>
                </div>
                <Progress value={(goal.current / goal.goal) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Question Difficulty Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="mr-2 h-5 w-5" />
            Question Difficulty Analysis
          </CardTitle>
          <CardDescription>
            Performance metrics across different topics and difficulty levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questionDifficulty.map((topic, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{topic.topic}</span>
                  <Badge variant={topic.avgScore >= 70 ? 'default' : 'secondary'}>
                    {topic.avgScore}%
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {topic.attempts} attempts
                </div>
                <Progress value={topic.avgScore} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Students Needing Attention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Students Needing Attention
          </CardTitle>
          <CardDescription>
            Students performing below curriculum goals who may need intervention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {strugglingStudents.map((student, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.subject}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-medium">{student.score}%</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {student.issues.map((issue, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {issue}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>
            Overall class performance trends over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">+12%</div>
              <p className="text-sm text-muted-foreground">Improvement this month</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">87%</div>
              <p className="text-sm text-muted-foreground">Average class score</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">23</div>
              <p className="text-sm text-muted-foreground">Students above goal</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};