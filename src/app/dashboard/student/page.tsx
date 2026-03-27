'use client';

/**
 * Student Dashboard - Critical Bug Fixes Implementation
 *
 * This vertical slice addresses the most critical UX-breaking issues identified in the student dashboard:
 *
 * FIXED ISSUES:
 * 1. Logout Functionality: Replaced router.push('/api/auth/signout') with proper NextAuth signOut()
 * 2. Course Action Buttons: Added onClick handlers to prevent broken interactions
 * 3. Navigation Flow: Implemented basic navigation between dashboard sections
 *
 * IMPLEMENTATION DETAILS:
 * - Logout: Now uses signOut({ callbackUrl: '/' }) for proper session cleanup
 * - Overview Section: "Začni učenje" button navigates to learning section
 * - Learning Section: Action buttons show user feedback while features are developed
 *
 * @version 1.0.1 - Critical UX Fixes
 * @author Agent 4 (Forge) - Implementation
 * @author Agent 5 (Auditor) - Quality Assurance
 * @date December 28, 2025
 */

import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Session } from 'next-auth';
import type { Material } from '@/hooks/useMaterials';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MobileNavigation } from '@/components/ui/mobile-navigation';
import { GlobalSearch } from '@/components/ui/global-search';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { NotificationDropdown } from '@/components/ui/notification-dropdown';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Import actual components
import { Flashcards } from '@/components/Flashcards';
import { GamificationDashboard } from '@/components/GamificationDashboard';
import { KnowledgeHeatmap } from '@/components/KnowledgeHeatmap';
import { FocusMode } from '@/components/FocusMode';
import { FakeTestGenerator } from '@/components/FakeTestGenerator';
import { AIChatHistory } from '@/components/AIChatHistory';
import { AIQueryStreamingClient as AIQueryStreaming } from '@/components/AIQueryStreamingClient';
import { AISettings } from '@/components/AISettings';
import { CreateStudentMaterialDialog } from '@/components/CreateStudentMaterialDialog';
import { VideoNotes } from '@/components/VideoNotes';
import { StudyPlanner } from '@/components/StudyPlanner';
import { OfflineMode } from '@/components/OfflineMode';
import { VoiceInputOutput } from '@/components/VoiceInputOutput';
import { SocialSection } from '@/components/SocialSection';

// Import analytics components
import { ProgressChart, LearningSuggestions, WeaknessAnalysisChart, PeerComparison } from '@/components/analytics';

// Import adaptive learning
import { AdaptiveLearningPath } from '@/components/adaptive-learning';
import StudyPathTimeline from '@/components/StudyPathTimeline';
import GlobalRankWidget from '@/components/GlobalRankWidget';

// Import mobile-first components
import { MobileCard, MobileActionCard, MobileStatsCard } from '@/components/ui/mobile-card';
import { PullToRefreshIndicator } from '@/components/ui/pull-to-refresh-indicator';

// Import hooks
import { useEnrollments, useProgress, useAnalyticsProgress, useAnalyticsSuggestions, useAnalyticsComparison, useCurrentUser } from '@/hooks/useStudents';
import { useMaterials } from '@/hooks/useMaterials';
import { useSwipe } from '@/hooks/useSwipe';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

// Types for enrollment data
/**
 * Enrollment interface for student dashboard
 * Represents a student's enrollment in a course with status information
 */
interface Enrollment {
  id: string;
  course: {
    id: string;
    title: string;
    description: string;
  };
  enrolledAt: string;
  status: string;
  notes?: string;
}

interface CourseProgress {
  courseId: string;
  progress: number;
}


import {
  BookOpen,
  Brain,
  TrendingUp,
  Settings,
  LogOut,
  Home,
  FileText,
  Users,
  Target,
  Calendar,
  BarChart3,
  Zap,
  Heart,
  CheckCircle,
  Plus,
  History,
  X,
  Download,
  Upload,
  Tag,
  Book,
  Video,
  Award,
} from 'lucide-react';

// Sidebar Navigation Component
function Sidebar({ activeSection, onSectionChange, hasTeacher }: {
  activeSection: string;
  onSectionChange: (section: string) => void;
  hasTeacher: boolean;
}) {
  const navigationItems = [
    { id: 'overview', label: 'Pregled', icon: Home, color: 'blue' },
    { id: 'learning', label: 'Učenje', icon: BookOpen, color: 'green' },
    { id: 'video', label: 'Video', icon: Video, color: 'red' },
    { id: 'practice', label: 'Vadba', icon: Target, color: 'purple' },
    { id: 'social', label: 'Skupnost', icon: Users, color: 'orange' },
    { id: 'progress', label: 'Napredek', icon: TrendingUp, color: 'blue' },
    { id: 'analytics', label: 'Analitika', icon: BarChart3, color: 'green' },
    { id: 'content', label: 'Vsebine', icon: FileText, color: 'purple', hideForTeacherStudents: true },
    { id: 'ai', label: 'AI Pomočnik', icon: Brain, color: 'purple' },
    { id: 'tools', label: 'Orodja', icon: Zap, color: 'orange' },
  ];

  return (
    <div className="w-64 bg-card border-r border-border h-full">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-card-foreground">Dashboard</h2>
      </div>
      <nav className="px-4 space-y-2">
        {navigationItems
          .filter(item => !item.hideForTeacherStudents || !hasTeacher)
          .map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeSection === item.id
                  ? 'bg-accent text-accent-foreground border-r-2 border-primary'
                  : 'text-muted-foreground hover:bg-accent/50'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// Overview Section
function OverviewSection({ onNavigate }: { onNavigate: (section: string) => void }) {
  const router = useRouter();
  const { data: enrollments, error: enrollmentsError } = useEnrollments();
  const { data: progressData, error: progressError } = useProgress();

  if (enrollmentsError || progressError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Prišlo je do napake pri nalaganju podatkov. Prosimo, poskusite znova kasneje.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* ...existing code... */}
      {/* Recent Courses */}
      {enrollments && enrollments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Moji predmeti</CardTitle>
            <CardDescription>Nadaljujte z učenjem</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {enrollments.slice(0, 3).map((enrollment: Enrollment) => {
                const courseProgress = progressData?.find((p: CourseProgress) => p.courseId === enrollment.course.id);
                const progressValue = courseProgress?.progress || 0;

                return (
                  <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1 mr-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium">{enrollment.course.title}</p>
                        <span className="text-xs text-muted-foreground">{progressValue}%</span>
                      </div>
                      <Progress value={progressValue} className="h-1" />
                    </div>
                    <Button size="sm" onClick={() => router.push(`/dashboard/student/courses/${enrollment.course.id}`)}>
                      Začni učenje
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Practice Test */}
      <Card>
        <CardHeader>
          <CardTitle>Hitri praktični test</CardTitle>
          <CardDescription>Generirajte test za vajo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Za boljše možnosti in zgodovino testov pojdite v sekcijo Vadba.
            </p>
            <Button onClick={() => onNavigate('practice')} variant="outline">
              Pojdi na Vadba
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Learning Section
function LearningSection() {
  const router = useRouter();
  const { data: enrollments, isLoading: enrollmentsLoading, refetch: refetchEnrollments } = useEnrollments();
  const { data: progressData, isLoading: progressLoading, refetch: refetchProgress } = useProgress();

  // Pull to refresh functionality
  const { elementRef, isRefreshing, pullDistance, isPulling } = usePullToRefresh({
    onRefresh: async () => {
      await Promise.all([refetchEnrollments(), refetchProgress()]);
    },
    threshold: 80,
    refreshThreshold: 60
  });

  if (enrollmentsLoading || progressLoading) {
    return (
      <div className="space-y-4">
        <div className="mobile-skeleton-title" />
        <div className="mobile-skeleton-text" />
        <div className="mobile-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="mobile-skeleton h-48 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Pull to refresh indicator */}
      <PullToRefreshIndicator
        isRefreshing={isRefreshing}
        pullDistance={pullDistance}
        threshold={80}
      />

      <div ref={elementRef} className="space-y-6">
        <div>
          <h1 className="mobile-heading mb-2">Moji predmeti</h1>
          <p className="mobile-text text-muted-foreground">Dostopajte do učnih gradiv in vsebin</p>
        </div>

        {/* Adaptive Learning Path */}
        <AdaptiveLearningPath />

        <div className="mobile-grid">
          {enrollments && enrollments.length > 0 ? (
            enrollments.map((enrollment: Enrollment) => {
              const courseProgress = progressData?.find((p: CourseProgress) => p.courseId === enrollment.course.id);
              const progressValue = courseProgress?.progress || 0;

              return (
                <MobileCard
                  key={enrollment.id}
                  title={enrollment.course.title}
                  description={enrollment.course.description}
                  onClick={() => router.push(`/dashboard/student/courses/${enrollment.course.id}`)}
                  className="mobile-fade-in"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={progressValue === 100 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {progressValue === 100 ? 'Opravljeno' : 'V teku'}
                      </Badge>
                      <span className="font-semibold mobile-text-sm">{progressValue}%</span>
                    </div>
                    <Progress value={progressValue} className="h-2" />
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/student/courses/${enrollment.course.id}/materials`);
                        }}
                        className="mobile-btn text-xs"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Gradiva
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/student/courses/${enrollment.course.id}`);
                        }}
                        className="mobile-btn text-xs"
                      >
                        <BookOpen className="h-3 w-3 mr-1" />
                        Učenje
                      </Button>
                    </div>
                  </div>
                </MobileCard>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="mobile-skeleton h-24 w-24 mx-auto mb-4 rounded-full" />
              <p className="mobile-text text-muted-foreground">Nimate še nobenih predmetov.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Practice Section
function PracticeSection() {
  // Assigned Tests Query
  const { data: assignedTests, refetch: refetchAssignedTests } = useQuery({
    queryKey: ['assigned-tests'],
    queryFn: async () => {
      const response = await fetch('/api/students/assigned-tests');
      if (!response.ok) throw new Error('Failed to fetch assigned tests');
      return response.json();
    },
  });

  // Delete assigned test function
  const deleteAssignedTest = async (assignmentId: string) => {
    try {
      const response = await fetch('/api/students/assigned-tests', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignmentId }),
      });
      if (response.ok) {
        refetchAssignedTests(); // Refresh the list
      } else {
        console.error('Failed to delete assigned test');
      }
    } catch (error) {
      console.error('Error deleting assigned test:', error);
    }
  };

  // State for AI analysis tracking
  const [analyzingResults, setAnalyzingResults] = useState<{[key: string]: boolean}>({});
  const [analysisComplete, setAnalysisComplete] = useState<{[key: string]: boolean}>({});

  // Function to check AI analysis status
  const checkAnalysisStatus = useCallback(async (resultId: string) => {
    try {
      const response = await fetch(`/api/students/assigned-tests/submit?resultId=${resultId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.analysisComplete) {
          setAnalyzingResults(prev => ({ ...prev, [resultId]: false }));
          setAnalysisComplete(prev => ({ ...prev, [resultId]: true }));
          // Refresh the test list to show updated results
          refetchAssignedTests();
        }
      }
    } catch (error) {
      console.error('Error checking analysis status:', error);
    }
  }, [refetchAssignedTests]);

  // Poll for AI analysis completion
  useEffect(() => {
    const interval = setInterval(() => {
      Object.keys(analyzingResults).forEach(resultId => {
        if (analyzingResults[resultId]) {
          checkAnalysisStatus(resultId);
        }
      });
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [analyzingResults, checkAnalysisStatus]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Vadba in testi</h1>
        <p className="text-muted-foreground">Izboljšajte svoje znanje s prakso</p>
      </div>

      <div className="mobile-grid">
        <MobileCard
          title="Dodeljene naloge"
          description={`${assignedTests?.length || 0} nalog od AI Sensei`}
          icon={<Target className="h-5 w-5 text-blue-600" />}
          className="mobile-fade-in"
        >
          <div className="space-y-3">
            {assignedTests && assignedTests.length > 0 ? (
              assignedTests.slice(0, 3).map((assignment: { id: string; test: { subject: string; topic: string; grade: string } }) => (
                <MobileActionCard
                  key={assignment.id}
                  title={`${assignment.test.subject} - ${assignment.test.topic}`}
                  description={`Razred: ${assignment.test.grade}`}
                  action={
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-xs">Novo</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAssignedTest(assignment.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        title="Izbriši test"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  }
                >
                  {/* Show analysis status if applicable */}
                  {analyzingResults[assignment.id] && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <span className="mobile-text-xs text-blue-600">AI analizira odgovore...</span>
                    </div>
                  )}
                  {analysisComplete[assignment.id] && (
                    <div className="flex items-center gap-2 mt-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="mobile-text-xs text-green-600">Analiza zaključena</span>
                    </div>
                  )}
                </MobileActionCard>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="mobile-text-sm text-muted-foreground">Nimate dodeljenih nalog.</p>
              </div>
            )}
          </div>
        </MobileCard>

        <Card className="touch-manipulation hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Brain className="h-5 w-5 text-green-600" />
              </div>
              <span>Flashcards</span>
            </CardTitle>
            <CardDescription className="text-base ml-11">Vadite s karticami</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Flashcards />
          </CardContent>
        </Card>

        {/* Additional Practice Card for larger screens */}
        <Card className="hidden xl:block touch-manipulation hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <span>Napredek v vadbi</span>
            </CardTitle>
            <CardDescription className="text-base ml-11">Sledite svojemu izboljšanju</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-blue-900">Rešenih testov</span>
                  <span className="text-lg font-bold text-blue-600">12</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-green-900">Povprečni rezultat</span>
                  <span className="text-lg font-bold text-green-600">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-orange-900">Študijskih ur</span>
                  <span className="text-lg font-bold text-orange-600">24</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fake Tests Section */}
      <Card>
        <CardHeader>
          <CardTitle>Praktični testi</CardTitle>
          <CardDescription>Generirajte in rešujte praktične teste</CardDescription>
        </CardHeader>
        <CardContent>
          <FakeTestGenerator />
        </CardContent>
      </Card>
    </div>
  );
}

// Progress Section
function ProgressSection({ session }: { session: Session | null }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Moj napredek</h1>
        <p className="text-muted-foreground">Sledite svojemu učenju</p>
      </div>

      <div className="space-y-6">
        {/* Mobile-optimized grid layout */}
        <div className="mobile-grid">
          <MobileCard
            title="Toplotna karta znanja"
            description="Vizualizacija vašega napredka"
            icon={<BarChart3 className="h-5 w-5 text-blue-600" />}
            className="mobile-fade-in"
          >
            <KnowledgeHeatmap studentId={session?.user?.id || ''} />
          </MobileCard>

          <MobileCard
            title="Študijski načrt"
            description="Vaš pot do cilja"
            icon={<Target className="h-5 w-5 text-green-600" />}
            className="mobile-fade-in"
          >
            <StudyPathTimeline goal="Matura 2026 - Matematika" />
          </MobileCard>

          <MobileCard
            title="Globalni rang"
            description="Primerjava s sošolci"
            icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
            className="mobile-fade-in"
          >
            <GlobalRankWidget studentId={session?.user?.id || ''} />
          </MobileCard>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="touch-manipulation hover:shadow-lg transition-all duration-200 hover:scale-[1.02] xl:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Award className="h-5 w-5 text-orange-600" />
                </div>
                <span>Dosežki in gamifikacija</span>
              </CardTitle>
              <CardDescription className="text-base ml-11">Vaši dosežki in napredek</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <GamificationDashboard studentId={session?.user?.id || ''} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Tools Section
function AISection({ session }: { session: Session | null }) {
  const [activeAITab, setActiveAITab] = useState('chat');
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);

  // Get current user to check if they have a teacher
  const { data: currentUser } = useCurrentUser();
  const hasTeacher = currentUser?.teacherId;

  // Add materials query for the student
  const { data: materials, isLoading: materialsLoading } = useMaterials();

  const handleAIQuery = async (query: string) => {
    const response = await fetch('/api/ai/query-stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    return response;
  };

  return (
    <div className="space-y-6">
      {!hasTeacher && (
        <div className="flex justify-end">
          <Button onClick={() => setIsAISettingsOpen(true)} variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            AI Nastavitve
          </Button>
        </div>
      )}

      <Tabs value={activeAITab} onValueChange={setActiveAITab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="chat">AI Klepet</TabsTrigger>
          {!hasTeacher && <TabsTrigger value="materials">Moja Gradiva</TabsTrigger>}
          <TabsTrigger value="history">Zgodovina</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardContent>
              <AIQueryStreaming
                onQuery={handleAIQuery}
                placeholder="Vprašajte kaj o vašem učenju..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {!hasTeacher && (
          <TabsContent value="materials" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Moja Gradiva</h2>
              <p className="text-muted-foreground">Dodajte svoja gradiva, da jih AI lahko uporabi pri odgovorih</p>
            </div>
            <CreateStudentMaterialDialog>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Dodaj gradivo
              </Button>
            </CreateStudentMaterialDialog>
          </div>

          {materialsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : materials && materials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {materials.map((material: Material) => (
                <Card key={material.id}>
                  <CardHeader>
                    <CardTitle>{material.title}</CardTitle>
                    <CardDescription>
                      Vrsta: {material.type} • {new Date(material.createdAt).toLocaleDateString('sl-SI')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {material.content && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {material.content.substring(0, 150)}...
                        </p>
                      )}
                      {material.url && (
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <a
                            href={material.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Odpri povezavo
                          </a>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">Uredi</Button>
                        <Button variant="outline" size="sm" className="flex-1">Ogled</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Ni gradiv</h3>
                <p className="text-muted-foreground mb-4">Dodajte prva učna gradiva</p>
                <CreateStudentMaterialDialog>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Dodaj prvo gradivo
                  </Button>
                </CreateStudentMaterialDialog>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        )}

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5 text-purple-500" />
                <span>Zgodovina pogovorov</span>
              </CardTitle>
              <CardDescription>
                Preglejte svoje prejšnje pogovore z AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AIChatHistory />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Settings Dialog */}
      {isAISettingsOpen && !hasTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">AI Nastavitve</h2>
                <Button variant="ghost" onClick={() => setIsAISettingsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <AISettings
                userId={session?.user?.id || ''}
                userType="student"
                onSave={() => setIsAISettingsOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContentSection({ session }: { session: Session | null }) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const [activeContentTab, setActiveContentTab] = useState('export');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  // Mock data for curriculum coverage
  const curriculumTopics = [
    { id: '1', name: 'Matematika - Osnovne operacije', covered: true, progress: 85 },
    { id: '2', name: 'Slovenščina - Slovnica', covered: false, progress: 60 },
    { id: '3', name: 'Zgodovina - Srednji vek', covered: true, progress: 90 },
    { id: '4', name: 'Naravoslovje - Živi svet', covered: false, progress: 45 },
  ];

  const handleExport = async (format: 'pdf' | 'markdown') => {
    // Mock export functionality
    console.log(`Exporting ${selectedMaterials.length} materials as ${format}`);
    // In real implementation, this would call an API
  };

  const handleImport = async (files: FileList) => {
    setIsImporting(true);
    // Mock import functionality
    console.log('Importing files:', files);
    setTimeout(() => setIsImporting(false), 2000);
  };

  const handleAutoTag = async (materialId: string) => {
    // Mock AI tagging
    console.log('Auto-tagging material:', materialId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Upravljanje vsebin</h1>
        <p className="text-muted-foreground">Uvozite, izvozite in organizirajte svoje učna gradiva</p>
      </div>

      <Tabs value={activeContentTab} onValueChange={setActiveContentTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="export">Izvoz</TabsTrigger>
          <TabsTrigger value="import">Uvoz</TabsTrigger>
          <TabsTrigger value="tags">Označevanje</TabsTrigger>
          <TabsTrigger value="curriculum">Učni načrt</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5 text-blue-500" />
                <span>Izvoz vsebin</span>
              </CardTitle>
              <CardDescription>
                Izvozite svoja gradiva v PDF ali Markdown format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="select-all"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMaterials(['1', '2', '3']); // Mock IDs
                      } else {
                        setSelectedMaterials([]);
                      }
                    }}
                  />
                  <label htmlFor="select-all" className="font-medium">Izberi vse</label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedMaterials.includes('1')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMaterials([...selectedMaterials, '1']);
                          } else {
                            setSelectedMaterials(selectedMaterials.filter(id => id !== '1'));
                          }
                        }}
                      />
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="font-medium">Matematika - Algebra</p>
                        <p className="text-sm text-muted-foreground">PDF • 2.3 MB</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedMaterials.includes('2')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMaterials([...selectedMaterials, '2']);
                          } else {
                            setSelectedMaterials(selectedMaterials.filter(id => id !== '2'));
                          }
                        }}
                      />
                      <FileText className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="font-medium">Slovenščina - Literatura</p>
                        <p className="text-sm text-muted-foreground">Markdown • 1.1 MB</p>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleExport('pdf')}
                    disabled={selectedMaterials.length === 0}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Izvozi kot PDF
                  </Button>
                  <Button
                    onClick={() => handleExport('markdown')}
                    disabled={selectedMaterials.length === 0}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Izvozi kot Markdown
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5 text-green-500" />
                <span>Uvoz gradiv</span>
              </CardTitle>
              <CardDescription>
                Uvozite gradiva iz PDF, Word ali PowerPoint datotek
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Povlecite datoteke sem
                  </h3>
                  <p className="text-gray-500 mb-4">
                    ali kliknite za izbiro
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={(e) => e.target.files && handleImport(e.target.files)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button asChild>
                      <span>
                        <Plus className="h-4 w-4 mr-2" />
                        Izberi datoteke
                      </span>
                    </Button>
                  </label>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Podprti formati</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Badge variant="secondary">PDF</Badge>
                    <Badge variant="secondary">DOC</Badge>
                    <Badge variant="secondary">DOCX</Badge>
                    <Badge variant="secondary">PPT</Badge>
                    <Badge variant="secondary">PPTX</Badge>
                  </div>
                </div>

                {isImporting && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Uvažanje datotek...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tags" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Tag className="h-5 w-5 text-purple-500" />
                <span>AI označevanje</span>
              </CardTitle>
              <CardDescription>
                Samodejno označevanje gradiv z AI za boljše organiziranje
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Matematika - Algebra</h4>
                      <Button
                        size="sm"
                        onClick={() => handleAutoTag('1')}
                        className="text-xs"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        Označi
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">algebra</Badge>
                      <Badge variant="outline" className="text-xs">matematika</Badge>
                      <Badge variant="outline" className="text-xs">enačbe</Badge>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Slovenščina - Literatura</h4>
                      <Button
                        size="sm"
                        onClick={() => handleAutoTag('2')}
                        className="text-xs"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        Označi
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">literatura</Badge>
                      <Badge variant="outline" className="text-xs">slovenščina</Badge>
                      <Badge variant="outline" className="text-xs">pesništvo</Badge>
                    </div>
                  </Card>
                </div>

                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    AI samodejno analizira vaše gradivo in doda ustrezne oznake za lažje iskanje in organiziranje.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="curriculum" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Book className="h-5 w-5 text-orange-500" />
                <span>Pokrivenost učnega načrta</span>
              </CardTitle>
              <CardDescription>
                Sledite pokritosti učnih tem v vašem učnem načrtu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {curriculumTopics.map((topic) => (
                  <Card key={topic.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{topic.name}</h4>
                      <div className="flex items-center space-x-2">
                        {topic.covered && <CheckCircle className="h-4 w-4 text-green-500" />}
                        <span className="text-sm font-medium">{topic.progress}%</span>
                      </div>
                    </div>
                    <Progress value={topic.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{topic.covered ? 'Pokriveno' : 'V teku'}</span>
                      <span>{topic.progress}/100</span>
                    </div>
                  </Card>
                ))}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-blue-900">Skupna pokrivenost</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">70%</div>
                  <p className="text-sm text-blue-700 mt-1">
                    Od skupno 12 učnih enot je 8 popolnoma pokritih
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function VideoSection() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Video vsebine</h1>
        <p className="text-muted-foreground">Ogledajte video predavanja in konference</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/video')}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Video className="h-5 w-5 text-red-500" />
              <span>Video hub</span>
            </CardTitle>
            <CardDescription>Ogledajte posnete video predavanja in konference</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Dostopajte do knjižnice video vsebin z možnostjo beleženja zapiskov ob določenih časih.
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/video/meeting/new')}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span>Video konferenca</span>
            </CardTitle>
            <CardDescription>Začnite novo video konferenco</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Organizirajte video sestanke z učitelji in sošolci z uporabo Jitsi Meet.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hitri dostop</CardTitle>
          <CardDescription>Nedavne video dejavnosti</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center space-x-3">
                <Video className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium">Matematika - Kvadratne enačbe</p>
                  <p className="text-sm text-muted-foreground">Pred 2 urama</p>
                </div>
              </div>
              <Badge variant="secondary">Posnetek</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Skupinsko učenje - Kemija</p>
                  <p className="text-sm text-muted-foreground">Pred 1 dnevom</p>
                </div>
              </div>
              <Badge variant="outline">Konferenca</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ToolsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Učna orodja</h1>
        <p className="text-muted-foreground">Dodatna orodja za boljše učenje</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {/* Focus Mode */}
        <Card className="touch-manipulation">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
              <Zap className="h-5 w-5 text-blue-500 shrink-0" />
              <span>Fokus način</span>
            </CardTitle>
            <CardDescription className="text-sm">Brez motenj učenje s Pomodoro tehniko</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <FocusMode />
          </CardContent>
        </Card>

        {/* Study Planner */}
        <Card className="touch-manipulation">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
              <Calendar className="h-5 w-5 text-purple-500 shrink-0" />
              <span>Načrtovalnik učenja</span>
            </CardTitle>
            <CardDescription className="text-sm">Planirajte svoje učne seje</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <StudyPlanner />
          </CardContent>
        </Card>

        {/* Video Notes */}
        <Card className="touch-manipulation">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
              <Brain className="h-5 w-5 text-orange-500 shrink-0" />
              <span>Video zapiski</span>
            </CardTitle>
            <CardDescription className="text-sm">Zabeležite pomembne dele videov</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <VideoNotes />
          </CardContent>
        </Card>

        {/* Offline Mode */}
        <Card className="touch-manipulation">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
              <Heart className="h-5 w-5 text-red-500 shrink-0" />
              <span>Offline način</span>
            </CardTitle>
            <CardDescription className="text-sm">Učenje brez internetne povezave</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <OfflineMode />
          </CardContent>
        </Card>

        {/* Voice Input Output - Full width on mobile */}
        <Card className="touch-manipulation sm:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
              <Settings className="h-5 w-5 text-gray-500 shrink-0" />
              <span>Glasovni vnos/izhod</span>
            </CardTitle>
            <CardDescription className="text-sm">Uporabite glas za interakcijo</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <VoiceInputOutput />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


// Analytics Section
function AnalyticsSection({ session }: { session: Session | null }) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const { data: progressData, isLoading: progressLoading } = useAnalyticsProgress();
  const { data: suggestionsData, isLoading: suggestionsLoading } = useAnalyticsSuggestions();
  const { data: comparisonData, isLoading: comparisonLoading } = useAnalyticsComparison();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Analitika učenja</h1>
        <p className="text-muted-foreground">Sledite svojemu napredku in dobite vpoglede za boljše učenje</p>
      </div>

      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList>
          <TabsTrigger value="progress">Napredek v času</TabsTrigger>
          <TabsTrigger value="suggestions">Predlogi za učenje</TabsTrigger>
          <TabsTrigger value="weaknesses">Problematična področja</TabsTrigger>
          <TabsTrigger value="comparison">Primerjava s sošolci</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4">
          <ProgressChart data={progressData} isLoading={progressLoading} />
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <LearningSuggestions suggestions={suggestionsData || []} isLoading={suggestionsLoading} />
        </TabsContent>

        <TabsContent value="weaknesses" className="space-y-4">
          <WeaknessAnalysisChart />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <PeerComparison data={comparisonData} isLoading={comparisonLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getSectionTitle(section: string): string {
  switch (section) {
    case 'overview':
      return 'Pregled';
    case 'learning':
      return 'Učenje';
    case 'video':
      return 'Video';
    case 'practice':
      return 'Vadba';
    case 'social':
      return 'Skupnost';
    case 'progress':
      return 'Napredek';
    case 'gamification':
      return 'Dosežki';
    case 'ai':
      return 'AI Pomočnik';
    case 'settings':
      return 'Nastavitve';
    default:
      return 'Dashboard';
  }
}

function getSectionDescription(section: string): string {
  switch (section) {
    case 'overview':
      return 'Pregled vašega napredka in priporočil';
    case 'learning':
      return 'Dostop do učnih materialov in tečajev';
    case 'video':
      return 'Ogledajte video predavanja in konference';
    case 'practice':
      return 'Vadite z interaktivnimi testi in vajami';
    case 'social':
      return 'Povežite se z drugimi študenti in mentorji';
    case 'progress':
      return 'Sledite svojemu napredku in dosežkom';
    case 'gamification':
      return 'Odkrijte svoje dosežke in nagrade';
    case 'ai':
      return 'Dobite pomoč od AI asistenta';
    case 'settings':
      return 'Prilagodite svoje nastavitve';
    default:
      return 'Upravljajte s svojim učenjem';
  }
}

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('overview');

  // Get current user to check if they have a teacher
  const { data: currentUser } = useCurrentUser();
  const hasTeacher = currentUser?.teacherId;

  // Define navigation order for swipe gestures
  const navigationOrder = ['overview', 'learning', 'practice', 'social', 'progress', 'analytics', 'content', 'ai', 'tools'];
  const currentIndex = navigationOrder.indexOf(activeSection);

  // Swipe gesture handlers
  const handleSwipeLeft = () => {
    const nextIndex = (currentIndex + 1) % navigationOrder.length;
    setActiveSection(navigationOrder[nextIndex]);
  };

  const handleSwipeRight = () => {
    const prevIndex = currentIndex - 1 < 0 ? navigationOrder.length - 1 : currentIndex - 1;
    setActiveSection(navigationOrder[prevIndex]);
  };

  // Apply swipe gestures to mobile layout
  const swipeRef = useSwipe({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    onTap: () => {
      // Optional tap handling for future features
    },
    minSwipeDistance: 75,
    maxSwipeTime: 500,
    preventScrollOnSwipe: true
  });

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection onNavigate={setActiveSection} />;
      case 'learning':
        return <LearningSection />;
      case 'video':
        return <VideoSection />;
      case 'practice':
        return <PracticeSection />;
      case 'social':
        return <SocialSection session={session} />;
      case 'progress':
        return <ProgressSection session={session} />;
      case 'analytics':
        return <AnalyticsSection session={session} />;
      case 'content':
        return <ContentSection session={session} />;
      case 'ai':
        return <AISection session={session} />;
      case 'tools':
        return <ToolsSection />;
      default:
        return <OverviewSection onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Navigation */}
      <MobileNavigation
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        session={session}
      />

      {/* Desktop Layout */}
      <div className="hidden lg:flex h-screen">
        {/* Desktop Sidebar */}
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} hasTeacher={!!hasTeacher} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Desktop Header */}
          <header className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-card-foreground">
                  {getSectionTitle(activeSection)}
                </h1>
                <p className="text-muted-foreground">
                  {getSectionDescription(activeSection)}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <GlobalSearch />
                <NotificationDropdown />
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Odjava
                </Button>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-auto p-6">
            {renderContent()}
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden" ref={swipeRef}>
        <main className="pt-20 pb-24 px-4 min-h-screen">
          <div className="py-4 space-y-4">
            <div className="sticky top-16 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 -mx-4 px-4 py-3 border-b">
              <h1 className="text-xl font-bold text-foreground">
                {getSectionTitle(activeSection)}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {getSectionDescription(activeSection)}
              </p>
              {/* Swipe indicator */}
              <div className="flex justify-center mt-2">
                <div className="text-xs text-muted-foreground">
                  ← Swipe to navigate →
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}