'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, TrendingUp, BookOpen, Target, MessageSquare, AlertCircle } from 'lucide-react';
import { ParentMobileNavigation } from '@/components/ui/parent-mobile-navigation';
import { useQuery } from '@tanstack/react-query';
import ObserverLink from '@/components/ObserverLink';

interface Student {
  id: string;
  name: string;
  email: string;
  gradeLevel?: string;
  avatar?: string;
  lastActive: Date;
  progress: {
    overall: number;
    courses: number;
    assignments: number;
    quizzes: number;
  };
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
    courseName?: string;
  }>;
  upcomingAssignments: Array<{
    id: string;
    title: string;
    courseName: string;
    dueDate: Date;
    status: 'pending' | 'overdue' | 'completed';
  }>;
}

export default function ParentPortal() {
  const { data: session } = useSession();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeSection, setActiveSection] = useState('overview');

  const { data: students, isLoading } = useQuery({
    queryKey: ['parent-students'],
    queryFn: async () => {
      const response = await fetch('/api/parent/students');
      if (!response.ok) throw new Error('Failed to fetch students');
      return response.json() as Promise<Student[]>;
    },
    enabled: !!session?.user,
  });

  useEffect(() => {
    if (students && students.length > 0 && !selectedStudent) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedStudent(students[0]);
    }
  }, [students, selectedStudent]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No Students Linked</h2>
        <p className="text-muted-foreground text-center max-w-md">
          You haven't linked any student accounts yet. Please contact your child's school administrator to link your account.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Mobile Navigation */}
      <ParentMobileNavigation
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        session={session}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Parent Portal</h1>
          <p className="text-muted-foreground">Monitor your child's academic progress</p>
        </div>
        <Button variant="outline">
          <MessageSquare className="h-4 w-4 mr-2" />
          Contact Teacher
        </Button>
      </div>

      {/* Student Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Student</CardTitle>
          <CardDescription>Choose which student to view progress for</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {students.map((student) => (
              <Button
                key={student.id}
                variant={selectedStudent?.id === student.id ? "default" : "outline"}
                onClick={() => setSelectedStudent(student)}
                className="flex items-center gap-3 p-4 h-auto"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={student.avatar} />
                  <AvatarFallback>{student.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="font-medium">{student.name}</div>
                  <div className="text-sm text-muted-foreground">{student.gradeLevel}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedStudent && (
        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="observer">Observer</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{selectedStudent.progress.overall}%</div>
                  <Progress value={selectedStudent.progress.overall} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Courses Completed</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{selectedStudent.progress.courses}</div>
                  <p className="text-xs text-muted-foreground">Active courses</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assignments Done</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{selectedStudent.progress.assignments}</div>
                  <p className="text-xs text-muted-foreground">This week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quiz Average</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{selectedStudent.progress.quizzes}%</div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest activities from {selectedStudent.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedStudent.recentActivities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.description}</p>
                        {activity.courseName && (
                          <p className="text-xs text-muted-foreground">{activity.courseName}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="observer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Observer Links</CardTitle>
                <CardDescription>Generate a temporary observer link for this student</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Observer link component */}
                  <ObserverLink studentId={selectedStudent.id} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Progress</CardTitle>
                <CardDescription>Course-by-course progress breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* This would be populated with actual course data */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Mathematics</h4>
                      <p className="text-sm text-muted-foreground">Advanced Algebra</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">85%</div>
                      <Progress value={85} className="w-24" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Science</h4>
                      <p className="text-sm text-muted-foreground">Physics Fundamentals</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">72%</div>
                      <Progress value={72} className="w-24" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">English Literature</h4>
                      <p className="text-sm text-muted-foreground">Modern Literature</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">91%</div>
                      <Progress value={91} className="w-24" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Assignments</CardTitle>
                <CardDescription>Assignments due soon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedStudent.upcomingAssignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{assignment.title}</h4>
                        <p className="text-sm text-muted-foreground">{assignment.courseName}</p>
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={
                        assignment.status === 'overdue' ? 'destructive' :
                        assignment.status === 'completed' ? 'default' : 'secondary'
                      }>
                        {assignment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
                <CardDescription>Detailed activity history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedStudent.recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.description}</p>
                        {activity.courseName && (
                          <p className="text-xs text-muted-foreground">{activity.courseName}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}