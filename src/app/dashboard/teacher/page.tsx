'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Session } from 'next-auth';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { GlobalSearch } from '@/components/ui/global-search';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Mobile Navigation Component for Teachers
function TeacherMobileNavigation({
  isOpen,
  onClose,
  navigationItems,
  activeSection,
  onSectionChange
}: {
  isOpen: boolean;
  onClose: () => void;
  navigationItems: Array<{ id: string; label: string; icon: LucideIcon }>;
  activeSection: string;
  onSectionChange: (section: string) => void;
}) {
  return (
    <div className={`fixed inset-0 z-50 md:hidden ${isOpen ? 'block' : 'hidden'}`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute left-0 top-0 h-full w-80 bg-background border-r border-border shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border/50">
            <div>
              <h2 className="text-xl font-bold text-foreground">Meni</h2>
              <p className="text-sm text-muted-foreground">Učiteljski panel</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-10 w-10 p-0 touch-manipulation"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSectionChange(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center space-x-4 px-4 py-4 rounded-xl text-left transition-all duration-200 touch-manipulation ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md scale-[0.98]'
                      : 'text-muted-foreground hover:bg-accent/50 active:scale-95'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-primary-foreground/20' : 'bg-muted'}`}>
                    <Icon className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : ''}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`font-semibold text-base ${isActive ? 'text-primary-foreground' : ''}`}>
                      {item.label}
                    </span>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-border/50">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                AI Učni Portal v1.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useSwipe } from '@/hooks/useSwipe';

// Import teacher-specific components
import { AISettings } from '@/components/AISettings';
import { TeacherFakeTestGenerator } from '@/components/TeacherFakeTestGenerator';
import { CreateStudentDialog } from '@/components/CreateStudentDialog';
import { CreateCourseDialog } from '@/components/CreateCourseDialog';
import { CreateGroupDialog } from '@/components/CreateGroupDialog';
import { EditGroupDialog } from '@/components/EditGroupDialog';
import { AssignTaskDialog } from '@/components/AssignTaskDialog';
import CourseMembers from '@/components/CourseMembers';
import CourseMaterialsTasks from '@/components/CourseMaterialsTasks';
import CourseForum from '@/components/CourseForum';
import CourseAnalytics from '@/components/CourseAnalytics';
import { CreateMaterialDialog } from '@/components/CreateMaterialDialog';
import { EditCourseDialog } from '@/components/EditCourseDialog';
import { CourseDetailDialog } from '@/components/CourseDetailDialog';
import { TeacherAIAssistant } from '@/components/TeacherAIAssistant';

// Import teacher section components
import { AdvancedAnalyticsSection } from '@/components/teacher/AdvancedAnalyticsSection';
import { ParentsPortalSection } from '@/components/teacher/ParentsPortalSection';
import { CurriculumPlannerSection } from '@/components/teacher/CurriculumPlannerSection';
import { AIInsightsSection } from '@/components/teacher/AIInsightsSection';
import { PlagiarismDetectorSection } from '@/components/teacher/PlagiarismDetectorSection';
import { AutomatedNudgesSection } from '@/components/teacher/AutomatedNudgesSection';
import InterventionHub from '@/components/teacher/InterventionHub';

// Import hooks
import { useCourses, useStudents, useMaterials, useQuizzes, useGroups, useEnrollments, useEnrollStudent, useUnenrollStudent, useDeleteStudent, useDeleteGroup } from '@/hooks';
import { useStudentProfile, useStudentMaterials, useAssignMaterialToStudent } from '@/hooks/useStudents';
import type { StudentMaterial } from '@/hooks/useStudents';
import type { Group } from '@/hooks/useGroups';
import type { Material, Quiz } from '@/types';

/**
 * Enrollment interface for teacher dashboard
 * Represents a student's enrollment in a course
 */
interface Enrollment {
  id: string;
  course: {
    id: string;
    title: string;
  };
  student: {
    id: string;
    name: string;
    email: string;
  };
  enrolledAt: string;
  status: string;
  notes?: string;
}

/**
 * Student interface for teacher dashboard operations
 */
interface Student {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

/**
 * Course interface for teacher dashboard
 */
interface Course {
  id: string;
  title: string;
  description: string | null;
  teacherId: string;
  materials?: Material[];
  quizzes?: Quiz[];
  createdAt: Date;
  updatedAt: Date;
  joinCode: string | null;
}

import {
  BookOpen,
  Brain,
  Users,
  Settings,
  LogOut,
  Home,
  FileText,
  Calendar,
  BarChart3,
  Heart,
  ChevronRight,
  Award,
  AlertCircle,
  Plus,
  TrendingUp,
  UserCheck,
  Upload,
  Link,
  FileImage,
  FileVideo,
  File,
  Bell
} from 'lucide-react';

// Helper function to get file icon based on type
function getFileIcon(type: string) {
  switch (type) {
    case 'image':
      return FileImage;
    case 'video':
      return FileVideo;
    case 'pdf':
      return FileText;
    case 'link':
      return Link;
    default:
      return File;
  }
}

// Quick Access Cards for Overview
/**
 * QuickAccessCard Component (Teacher Dashboard)
 *
 * Reusable card component for teacher dashboard quick actions.
 * Consistent with linked-student dashboard implementation.
 *
 * @param icon - Lucide icon component
 * @param title - Card title
 * @param description - Card description
 * @param onClick - Click handler
 * @param badge - Optional badge text
 * @param color - Color theme (blue, green, purple, orange)
 */
function QuickAccessCard({ icon: Icon, title, description, onClick, badge, color = "blue" }: {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
  badge?: string;
  color?: string;
}) {
  const colorClasses = {
    blue: "border-blue-200 bg-blue-50 hover:bg-blue-100",
    green: "border-green-200 bg-green-50 hover:bg-green-100",
    purple: "border-purple-200 bg-purple-50 hover:bg-purple-100",
    orange: "border-orange-200 bg-orange-50 hover:bg-orange-100"
  };

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 touch-manipulation hover:shadow-md active:scale-95 ${colorClasses[color as keyof typeof colorClasses]}`}
      onClick={onClick}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-white shrink-0">
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm sm:text-base line-clamp-1">{title}</h3>
              {badge && <Badge variant="secondary" className="text-xs shrink-0">{badge}</Badge>}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

// Sidebar Navigation Component
function Sidebar({ activeSection, onSectionChange }: {
  activeSection: string;
  onSectionChange: (section: string) => void;
}) {
  const navigationItems = [
    { id: 'overview', label: 'Pregled', icon: Home },
    { id: 'courses', label: 'Tečaji', icon: BookOpen },
    { id: 'enrollments', label: 'Vpisovanje', icon: UserCheck },
    { id: 'materials', label: 'Gradiva', icon: FileText },
    { id: 'students', label: 'Učenci', icon: Users },
    { id: 'groups', label: 'Skupine', icon: Users },
    { id: 'analytics', label: 'Analitika', icon: BarChart3 },
    { id: 'advanced-analytics', label: 'Napredna analitika', icon: TrendingUp },
    { id: 'automated-nudges', label: 'AI Nudges', icon: Bell },
    { id: 'parents-portal', label: 'Portal za starše', icon: Heart },
    { id: 'curriculum-planner', label: 'Načrtovalnik kurikuluma', icon: Calendar },
    { id: 'plagiarism', label: 'Detektor plagiatorstva', icon: AlertCircle },
    { id: 'tools', label: 'Orodja', icon: Settings },
  ];

  return (
    <div className="w-64 bg-card border-r border-border h-full">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-card-foreground">Učiteljski panel</h2>
        <p className="text-sm text-muted-foreground mt-1">Upravljanje učenja</p>
      </div>
      <nav className="px-4 space-y-2">
        {navigationItems.map((item) => {
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
function OverviewSection({ session, onNavigate }: { session: Session | null; onNavigate: (section: string) => void }) {
  // Fetch data for overview
  const { data: courses, isLoading: coursesLoading } = useCourses();
  const { data: students, isLoading: studentsLoading } = useStudents();
  const { data: materials, isLoading: materialsLoading } = useMaterials();
  const { data: quizzes, isLoading: quizzesLoading } = useQuizzes();

  const isLoading = coursesLoading || studentsLoading || materialsLoading || quizzesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Pregled</h1>
          <p className="text-muted-foreground">Nalaganje podatkov...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Pregled</h1>
        <p className="text-muted-foreground">Dobrodošli, {session?.user?.name}! Tukaj je pregled vašega učnega okolja.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="touch-manipulation hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Tečaji</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{courses?.length || 0}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-50 rounded-lg shrink-0">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="touch-manipulation hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Učenci</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{students?.length || 0}</p>
              </div>
              <div className="p-2 sm:p-3 bg-green-50 rounded-lg shrink-0">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="touch-manipulation hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Gradiva</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{materials?.length || 0}</p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-50 rounded-lg shrink-0">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="touch-manipulation hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Kvizi</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{quizzes?.length || 0}</p>
              </div>
              <div className="p-2 sm:p-3 bg-orange-50 rounded-lg shrink-0">
                <Award className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <QuickAccessCard
          icon={Plus}
          title="Ustvari tečaj"
          description="Dodaj nov tečaj za učence"
          onClick={() => onNavigate('courses')}
          color="blue"
        />
        <QuickAccessCard
          icon={Users}
          title="Dodaj učenca"
          description="Registriraj novega učenca"
          onClick={() => onNavigate('students')}
          color="green"
        />
        <QuickAccessCard
          icon={FileText}
          title="Dodaj gradivo"
          description="Naloži učno gradivo"
          onClick={() => onNavigate('materials')}
          color="purple"
        />
        <QuickAccessCard
          icon={Award}
          title="Ustvari kviz"
          description="Pripravi test za učence"
          onClick={() => onNavigate('tools')}
          color="orange"
        />
        <QuickAccessCard
          icon={Users}
          title="Ustvari skupino"
          description="Organiziraj študijske skupine"
          onClick={() => onNavigate('groups')}
          color="green"
        />
        <QuickAccessCard
          icon={BarChart3}
          title="Ogled analitike"
          description="Sledi napredku učencev"
          onClick={() => onNavigate('analytics')}
          color="blue"
        />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Nedavna aktivnost</CardTitle>
          <CardDescription>Najnovejša gradiva in aktivnosti</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {materials?.slice(0, 3).map((material: Material) => (
              <div key={material.id} className="flex items-center space-x-3">
                {(() => {
                  const IconComponent = getFileIcon(material.type);
                  return <IconComponent className="h-4 w-4 text-blue-500" />;
                })()}
                <div className="flex-1">
                  <p className="text-sm font-medium">{material.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(material.createdAt).toLocaleDateString('sl-SI')}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-sm text-muted-foreground text-center py-4">
                Še ni gradiv
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Courses Section
function CoursesSection() {
  const { data: courses } = useCourses();
  const { data: enrollments } = useEnrollments();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Calculate student count for each course
  const getStudentCount = (courseId: string) => {
    return enrollments?.filter((enrollment: Enrollment) => enrollment.course.id === courseId).length || 0;
  };

  if (selectedCourseId) {
    const course = courses?.find((c: Course) => c.id === selectedCourseId);
    if (!course) return <div>Tečaj ni najden.</div>;
    return (
      <div className="space-y-8">
        <Button variant="ghost" onClick={() => setSelectedCourseId(null)}>
          ← Nazaj na seznam tečajev
        </Button>
        <h2 className="text-2xl font-bold mb-4">{course.title}</h2>
        <p className="text-muted-foreground mb-4">{course.description}</p>
        {/* Člani */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Člani tečaja</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <CourseMembers courseId={course.id} />
            </div>
          </CardContent>
        </Card>
        {/* Gradiva in naloge */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Gradiva in naloge</CardTitle>
          </CardHeader>
          <CardContent>
            <CourseMaterialsTasks courseId={course.id} />
          </CardContent>
        </Card>
        {/* Forum */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Forum tečaja</CardTitle>
          </CardHeader>
          <CardContent>
            <CourseForum courseId={course.id} userId={course.teacherId} />
          </CardContent>
        </Card>
        {/* Analitika */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Analitika tečaja</CardTitle>
          </CardHeader>
          <CardContent>
            <CourseAnalytics courseId={course.id} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Tečaji</h1>
          <p className="text-muted-foreground">Upravljajte svoje učne tečaje</p>
        </div>
        <CreateCourseDialog>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nov tečaj
          </Button>
        </CreateCourseDialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses?.map((course: Course & { materials?: Material[]; quizzes?: Quiz[] }) => {
          const safeCourse = {
            ...course,
            materials: course.materials ?? [],
            quizzes: (course.quizzes ?? []).map(q => ({ ...q, questions: [] })),
            joinCode: course.joinCode ?? null,
          };
          return (
            <Card key={course.id} className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]" onClick={() => setSelectedCourseId(course.id)}>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold line-clamp-2">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{safeCourse.materials.length}</p>
                      <p className="text-xs text-muted-foreground font-medium">Gradiv</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{safeCourse.quizzes.length}</p>
                      <p className="text-xs text-muted-foreground font-medium">Kvizi</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{getStudentCount(course.id)}</p>
                      <p className="text-xs text-muted-foreground font-medium">Učencev</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <EditCourseDialog course={safeCourse}>
                      <Button variant="outline" size="sm" className="flex-1">Uredi</Button>
                    </EditCourseDialog>
                    <CourseDetailDialog course={safeCourse}>
                      <Button variant="outline" size="sm" className="flex-1">Ogled</Button>
                    </CourseDetailDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }) || (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Ni tečajev</h3>
              <p className="text-muted-foreground mb-4">Začnite z ustvarjanjem prvega tečaja</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ustvari prvi tečaj
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Students Section
function StudentsSection() {
  const { data: students } = useStudents();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isAssignMaterialOpen, setIsAssignMaterialOpen] = useState(false);
  const [materialForm, setMaterialForm] = useState({
    title: '',
    type: 'text',
    url: '',
    content: '',
    courseId: '',
    file: null as File | null,
    uploadMethod: 'url' as 'url' | 'file',
  });

  const { data: studentProfile } = useStudentProfile(selectedStudentId || '');
  const { data: studentMaterials } = useStudentMaterials(selectedStudentId || '');
  const assignMaterial = useAssignMaterialToStudent();
  const deleteStudent = useDeleteStudent();

  const handleAssignMaterial = async () => {
    if (!selectedStudentId) return;

    try {
      let dataToSubmit: FormData | object;

      if (materialForm.uploadMethod === 'file' && materialForm.file) {
        // Use FormData for file uploads
        const formDataToSend = new FormData();
        formDataToSend.append('title', materialForm.title);
        formDataToSend.append('type', materialForm.type);
        formDataToSend.append('file', materialForm.file);
        if (materialForm.content) formDataToSend.append('content', materialForm.content);
        if (materialForm.courseId) formDataToSend.append('courseId', materialForm.courseId);

        dataToSubmit = formDataToSend;
      } else {
        // Use JSON for URL-based materials
        dataToSubmit = {
          title: materialForm.title,
          type: materialForm.type,
          url: materialForm.url,
          content: materialForm.content,
          courseId: materialForm.courseId || undefined,
        };
      }

      await assignMaterial.mutateAsync({
        studentId: selectedStudentId,
        materialData: dataToSubmit,
      });
      setMaterialForm({
        title: '',
        type: 'text',
        url: '',
        content: '',
        courseId: '',
        file: null,
        uploadMethod: 'url',
      });
      setIsAssignMaterialOpen(false);
    } catch {
      // Error is handled by the mutation
    }
  };

  if (selectedStudentId && studentProfile) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => setSelectedStudentId(null)}>
              ← Nazaj na učence
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{studentProfile.student.name || 'Učenec'}</h1>
              <p className="text-muted-foreground">{studentProfile.student.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={() => setIsAssignMaterialOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Dodeli gradivo
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!selectedStudentId) return;
                // Confirm
                const ok = window.confirm('Potrdite izbris učenca. To je trajno in bo odstranilo vse povezave z učencem.');
                if (!ok) return;
                try {
                  await deleteStudent.mutateAsync(selectedStudentId);
                  setSelectedStudentId(null);
                } catch (err) {
                  console.error('Delete failed', err);
                  alert('Napaka pri brisanju učenca');
                }
              }}
            >
              Izbriši učenca
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Statistics */}
          <div className="md:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Statistika učenja</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Skupni čas učenja</span>
                  <Badge variant="secondary">{Math.round(studentProfile.totalStudyTime / 60)} min</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Dokončani kvizi</span>
                  <Badge variant="secondary">{studentProfile.completedQuizzes}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Povprečni rezultat</span>
                  <Badge variant="secondary">{studentProfile.averageScore}%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Zaporedje učenja</span>
                  <Badge variant="secondary">{studentProfile.learningStreak} dni</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Močne strani</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {studentProfile.strengths?.map((strength: string, index: number) => (
                    <Badge key={index} variant="outline" className="mr-2 mb-2">
                      {strength}
                    </Badge>
                  )) || <p className="text-sm text-muted-foreground">Ni podatkov</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Šibke točke</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {studentProfile.weaknesses?.map((weakness: string, index: number) => (
                    <Badge key={index} variant="destructive" className="mr-2 mb-2">
                      {weakness}
                    </Badge>
                  )) || <p className="text-sm text-muted-foreground">Ni podatkov</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Materials */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Dodeljena gradiva</CardTitle>
                <CardDescription>Gradiva, ki so dodeljena temu učencu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentMaterials?.map((material: StudentMaterial) => (
                    <div key={material.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{material.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Vrsta: {material.type} • {new Date(material.createdAt).toLocaleDateString('sl-SI')}
                          </p>
                          {material.course && (
                            <p className="text-sm text-blue-600">Tečaj: {material.course.title}</p>
                          )}
                          {material.content && (
                            <p className="text-sm mt-2 line-clamp-2">{material.content}</p>
                          )}
                          {material.url && (
                            <a
                              href={material.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline flex items-center space-x-1"
                            >
                              {(() => {
                                const IconComponent = getFileIcon(material.type);
                                return <IconComponent className="h-3 w-3" />;
                              })()}
                              <span>{material.type === 'link' ? 'Odpri povezavo' : 'Prenesi datoteko'}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )) || (
                    <p className="text-center text-muted-foreground py-8">
                      Še ni dodeljenih gradiv
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Assign Material Dialog */}
        {isAssignMaterialOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Dodeli gradivo</h2>
                <Button variant="ghost" onClick={() => setIsAssignMaterialOpen(false)}>×</Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Naslov</Label>
                  <Input
                    id="title"
                    value={materialForm.title}
                    onChange={(e) => setMaterialForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Naslov gradiva"
                  />
                </div>
                
                <div>
                  <Label>Način nalaganja</Label>
                  <div className="flex space-x-2 mb-2">
                    <Button
                      type="button"
                      variant={materialForm.uploadMethod === 'url' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMaterialForm(prev => ({ ...prev, uploadMethod: 'url' }))}
                      className="flex items-center space-x-1"
                    >
                      <Link className="h-4 w-4" />
                      <span>URL</span>
                    </Button>
                    <Button
                      type="button"
                      variant={materialForm.uploadMethod === 'file' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMaterialForm(prev => ({ ...prev, uploadMethod: 'file' }))}
                      className="flex items-center space-x-1"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Datoteka</span>
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="type">Vrsta</Label>
                  <Select
                    value={materialForm.type}
                    onValueChange={(value) => setMaterialForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Besedilo</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="link">Povezava</SelectItem>
                      <SelectItem value="image">Slika</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {materialForm.uploadMethod === 'file' && (
                  <div>
                    <Label htmlFor="file">Izberi datoteko</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setMaterialForm(prev => ({ ...prev, file }));
                        if (file) {
                          // Auto-detect type based on file
                          if (file.type.startsWith('image/')) {
                            setMaterialForm(prev => ({ ...prev, type: 'image' }));
                          } else if (file.type === 'application/pdf') {
                            setMaterialForm(prev => ({ ...prev, type: 'pdf' }));
                          } else if (file.type.startsWith('video/')) {
                            setMaterialForm(prev => ({ ...prev, type: 'video' }));
                          }
                        }
                      }}
                      accept="image/*,video/*,application/pdf,text/*"
                    />
                    {materialForm.file && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Izbrana datoteka: {materialForm.file.name} ({(materialForm.file.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                )}

                {materialForm.uploadMethod === 'url' && materialForm.type === 'link' && (
                  <div>
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      value={materialForm.url}
                      onChange={(e) => setMaterialForm(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                )}

                {materialForm.uploadMethod === 'url' && (materialForm.type === 'text' || materialForm.type === 'pdf') && (
                  <div>
                    <Label htmlFor="content">Vsebina</Label>
                    <Textarea
                      id="content"
                      value={materialForm.content}
                      onChange={(e) => setMaterialForm(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Vnesite vsebino gradiva"
                      rows={4}
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAssignMaterialOpen(false)}>
                    Prekliči
                  </Button>
                  <Button onClick={handleAssignMaterial} disabled={assignMaterial.isPending}>
                    {assignMaterial.isPending ? 'Dodeljevanje...' : 'Dodeli'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Učenci</h1>
          <p className="text-muted-foreground">Upravljajte svoje učence</p>
        </div>
        <CreateStudentDialog>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj učenca
          </Button>
        </CreateStudentDialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {students?.map((student: Student) => (
          <Card key={student.id} className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]" onClick={() => setSelectedStudentId(student.id)}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-lg font-semibold">{student.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold line-clamp-1">{student.name || 'Brez imena'}</div>
                  <div className="text-sm text-muted-foreground truncate">{student.email}</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Registriran:</span>
                  <span className="font-medium">{new Date(student.createdAt).toLocaleDateString('sl-SI')}</span>
                </div>
                <Button variant="outline" className="w-full" onClick={(e) => { e.stopPropagation(); setSelectedStudentId(student.id); }}>
                  Ogled profila
                </Button>
              </div>
            </CardContent>
          </Card>
        )) || (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Ni učencev</h3>
              <p className="text-muted-foreground mb-4">Dodajte prvega učenca</p>
              <CreateStudentDialog>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj prvega učenca
                </Button>
              </CreateStudentDialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Groups Section
function GroupsSection() {
  const { data: groups } = useGroups();
  const deleteGroup = useDeleteGroup();
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Skupine</h1>
          <p className="text-muted-foreground">Upravljajte študijske skupine</p>
        </div>
        <CreateGroupDialog>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova skupina
          </Button>
        </CreateGroupDialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {groups?.map((group: Group) => (
          <Card key={group.id} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold line-clamp-2">{group.name}</CardTitle>
              <CardDescription className="line-clamp-2">{group.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Člani</span>
                  <Badge variant="secondary" className="text-sm px-3 py-1">{group.members?.length || 0}</Badge>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <EditGroupDialog group={group}>
                    <Button variant="outline" size="sm" className="w-full">Uredi skupino</Button>
                  </EditGroupDialog>
                  <AssignTaskDialog groupId={group.id}>
                    <Button variant="outline" size="sm" className="w-full">Dodeli nalogo</Button>
                  </AssignTaskDialog>
                  <Button variant="destructive" size="sm" className="w-full" onClick={async () => {
                    const ok = window.confirm('Potrdite izbris skupine. To bo trajno.');
                    if (!ok) return;
                    try {
                      await deleteGroup.mutateAsync(group.id);
                    } catch (err) {
                      console.error('Delete group failed', err);
                      alert('Napaka pri brisanju skupine');
                    }
                  }} disabled={deleteGroup.isPending}>Izbriši skupino</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )) || (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Ni skupin</h3>
              <p className="text-muted-foreground mb-4">Ustvarite prvo študijsko skupino</p>
              <CreateGroupDialog>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ustvari prvo skupino
                </Button>
              </CreateGroupDialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Materials Section
function MaterialsSection() {
  const { data: materials, isLoading, error } = useMaterials();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Gradiva</h1>
          <p className="text-muted-foreground">Nalaganje gradiv...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Gradiva</h1>
          <p className="text-muted-foreground">Napaka pri nalaganju gradiv</p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Napaka</h3>
            <p className="text-muted-foreground">Ni bilo mogoče naložiti gradiv. Poskusite znova.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Gradiva</h1>
          <p className="text-muted-foreground">Upravljajte učno gradivo</p>
        </div>
        <CreateMaterialDialog>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj gradivo
          </Button>
        </CreateMaterialDialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {materials?.map((material: Material) => (
          <Card key={material.id} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold line-clamp-2">{material.title}</CardTitle>
              <CardDescription className="flex items-center space-x-2">
                <span className="capitalize">{material.type}</span>
                <span>•</span>
                <span>{new Date(material.createdAt).toLocaleDateString('sl-SI')}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {material.content && (
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {material.content.substring(0, 150)}...
                  </p>
                )}
                {material.url && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {(() => {
                      const IconComponent = getFileIcon(material.type);
                      return <IconComponent className="h-5 w-5 text-blue-600 shrink-0" />;
                    })()}
                    <a
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline font-medium truncate"
                    >
                      {material.type === 'link' ? 'Odpri povezavo' : 'Prenesi datoteko'}
                    </a>
                  </div>
                )}
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="flex-1">Uredi</Button>
                  <Button variant="outline" size="sm" className="flex-1">Ogled</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )) || (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Ni gradiv</h3>
              <p className="text-muted-foreground mb-4">Dodajte prvo učna gradiva</p>
              <CreateMaterialDialog>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj prvo gradivo
                </Button>
              </CreateMaterialDialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Analytics Section
function AnalyticsSection() {
  const { data: students } = useStudents();
  const { data: courses } = useCourses();
  const { data: materials } = useMaterials();
  const { data: enrollments } = useEnrollments();

  // Calculate real analytics data
  const activeStudents = students?.length || 0;
  const totalCourses = courses?.length || 0;
  const totalMaterials = materials?.length || 0;
  const totalEnrollments = enrollments?.length || 0;

  // Find course with most materials
  const courseWithMostMaterials = courses?.reduce((max: Course, course: Course) => {
    const courseMaterials = materials?.filter((m: Material) => m.courseId === course.id).length || 0;
    const maxMaterials = materials?.filter((m: Material) => m.courseId === max.id).length || 0;
    return courseMaterials > maxMaterials ? course : max;
  });

  // Find course with most enrollments
  const courseWithMostEnrollments = courses?.reduce((max: Course, course: Course) => {
    const courseEnrollments = enrollments?.filter((e: Enrollment) => e.course.id === course.id).length || 0;
    const maxEnrollments = enrollments?.filter((e: Enrollment) => e.course.id === max.id).length || 0;
    return courseEnrollments > maxEnrollments ? course : max;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Analitika</h1>
        <p className="text-muted-foreground">Sledite napredku učencev in učinkovitosti tečajev</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-semibold">Statistika učencev</CardTitle>
            <CardDescription className="text-base">Pregled aktivnosti učencev</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-5">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-900">Aktivni učenci</span>
                <Badge variant="secondary" className="text-sm px-3 py-1 bg-blue-100 text-blue-800">{activeStudents}</Badge>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-green-900">Skupni vpisi</span>
                <Badge variant="secondary" className="text-sm px-3 py-1 bg-green-100 text-green-800">{totalEnrollments}</Badge>
              </div>
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-purple-900">Povprečno na tečaj</span>
                <Badge variant="secondary" className="text-sm px-3 py-1 bg-purple-100 text-purple-800">{totalCourses > 0 ? Math.round(totalEnrollments / totalCourses) : 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-semibold">Učinkovitost tečajev</CardTitle>
            <CardDescription className="text-base">Analiza uspešnosti tečajev</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-5">
              <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium text-orange-900">Največ učencev</span>
                <Badge variant="secondary" className="text-sm px-3 py-1 bg-orange-100 text-orange-800 truncate max-w-32" title={courseWithMostEnrollments?.title || '/'}>
                  {courseWithMostEnrollments?.title || '/'}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-red-900">Največ gradiv</span>
                <Badge variant="secondary" className="text-sm px-3 py-1 bg-red-100 text-red-800 truncate max-w-32" title={courseWithMostMaterials?.title || '/'}>
                  {courseWithMostMaterials?.title || '/'}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-lg">
                <span className="text-sm font-medium text-indigo-900">Skupaj gradiv</span>
                <Badge variant="secondary" className="text-sm px-3 py-1 bg-indigo-100 text-indigo-800">{totalMaterials}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Analytics Card for larger screens */}
        <Card className="hidden xl:block hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-semibold">Sistemski pregled</CardTitle>
            <CardDescription className="text-base">Celotna platforma na pogled</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-5">
              <div className="flex justify-between items-center p-4 bg-teal-50 rounded-lg">
                <span className="text-sm font-medium text-teal-900">Aktivni tečaji</span>
                <Badge variant="secondary" className="text-sm px-3 py-1 bg-teal-100 text-teal-800">{totalCourses}</Badge>
              </div>
              <div className="flex justify-between items-center p-4 bg-cyan-50 rounded-lg">
                <span className="text-sm font-medium text-cyan-900">Aktivni kvizi</span>
                <Badge variant="secondary" className="text-sm px-3 py-1 bg-cyan-100 text-cyan-800">{totalMaterials}</Badge>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-900">Stopnja aktivnosti</span>
                <Badge variant="secondary" className="text-sm px-3 py-1 bg-slate-100 text-slate-800">
                  {totalCourses > 0 && totalEnrollments > 0 ? Math.round((totalEnrollments / totalCourses) * 100) : 0}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Tools Section
function ToolsSection() {
  const { data: session } = useSession();
  const { data: courses } = useCourses();
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);
  const [isFakeTestGeneratorOpen, setIsFakeTestGeneratorOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Orodja</h1>
        <p className="text-muted-foreground">Dodatna orodja za učitelje</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center space-x-3 text-xl font-semibold">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <span>AI nastavitve</span>
            </CardTitle>
            <CardDescription className="text-base ml-11">Prilagodite AI pomočnika</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button onClick={() => setIsAISettingsOpen(true)} className="w-full mb-6" size="lg">
              Odpri nastavitve
            </Button>
            {/* AI vpogled */}
            <div className="space-y-6">
              <AIInsightsSection />
              {/* AI pomočnik */}
              <TeacherAIAssistant />
              {/* Intervention Hub */}
              {/* If teacher has a selected course, show interventions. For now show for first course */}
              {courses && courses.length > 0 && <InterventionHub courseId={courses[0].id} />}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center space-x-3 text-xl font-semibold">
              <div className="p-2 bg-green-100 rounded-lg">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <span>Generator testov</span>
            </CardTitle>
            <CardDescription className="text-base ml-11">Ustvarite praktične teste za učence</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button onClick={() => setIsFakeTestGeneratorOpen(true)} variant="outline" className="w-full" size="lg">
              Odpri generator
            </Button>
          </CardContent>
        </Card>

        {/* Additional Tools Card for larger screens */}
        <Card className="hidden xl:block hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center space-x-3 text-xl font-semibold">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <span>Napredna orodja</span>
            </CardTitle>
            <CardDescription className="text-base ml-11">Dodatne funkcije za učitelje</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <Button variant="outline" className="w-full" size="lg">
                <BarChart3 className="h-4 w-4 mr-2" />
                Napredna analitika
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                <Users className="h-4 w-4 mr-2" />
                Upravljanje skupin
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                <FileText className="h-4 w-4 mr-2" />
                Masovni uvoz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Settings Dialog */}
      {isAISettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">AI nastavitve</h2>
              <Button variant="ghost" onClick={() => setIsAISettingsOpen(false)}>×</Button>
            </div>
            <AISettings userId={session?.user?.id || ''} userType="teacher" onSave={() => setIsAISettingsOpen(false)} />
          </div>
        </div>
      )}

      {/* Fake Test Generator Dialog */}
      {isFakeTestGeneratorOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Generator testov</h2>
              <Button variant="ghost" onClick={() => setIsFakeTestGeneratorOpen(false)}>×</Button>
            </div>
            <TeacherFakeTestGenerator />
          </div>
        </div>
      )}
    </div>
  );
}

function EnrollmentSection() {
  const { data: enrollments, isLoading: enrollmentsLoading } = useEnrollments();
  const { data: courses } = useCourses();
  const { data: students } = useStudents();
  const enrollStudent = useEnrollStudent();
  const unenrollStudent = useUnenrollStudent();

  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [enrollmentNotes, setEnrollmentNotes] = useState('');

  const handleEnroll = async () => {
    if (!selectedCourse || !selectedStudent) return;

    try {
      await enrollStudent.mutateAsync({
        courseId: selectedCourse,
        studentId: selectedStudent,
        notes: enrollmentNotes
      });
      setSelectedCourse('');
      setSelectedStudent('');
      setEnrollmentNotes('');
    } catch (error) {
      console.error('Failed to enroll student:', error);
    }
  };

  const handleUnenroll = async (enrollmentId: string) => {
    try {
      await unenrollStudent.mutateAsync(enrollmentId);
    } catch (error) {
      console.error('Failed to unenroll student:', error);
    }
  };

  if (enrollmentsLoading) {
    return <div>Loading enrollments...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Vpisovanje učencev</h1>
        <p className="text-muted-foreground">Upravljajte z vpisi učencev v predmete</p>
      </div>

      {/* Enroll New Student */}
      <Card>
        <CardHeader>
          <CardTitle>Vpiši učenca</CardTitle>
          <CardDescription>Izberite predmet in učenca za vpis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="course-select">Predmet</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Izberite predmet" />
                </SelectTrigger>
                <SelectContent>
                  {courses?.map((course: Course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="student-select">Učenec</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Izberite učenca" />
                </SelectTrigger>
                <SelectContent>
                  {students?.map((student: Student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Opombe (opcijsko)</Label>
            <Textarea
              id="notes"
              placeholder="Dodajte opombe o vpisu..."
              value={enrollmentNotes}
              onChange={(e) => setEnrollmentNotes(e.target.value)}
            />
          </div>
          <Button
            onClick={handleEnroll}
            disabled={!selectedCourse || !selectedStudent || enrollStudent.isPending}
          >
            {enrollStudent.isPending ? 'Vpisovanje...' : 'Vpiši učenca'}
          </Button>
        </CardContent>
      </Card>

      {/* Current Enrollments */}
      <Card>
        <CardHeader>
          <CardTitle>Trenutni vpisi</CardTitle>
          <CardDescription>Seznam vseh vpisanih učencev</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {enrollments && enrollments.length > 0 ? (
              enrollments.map((enrollment: Enrollment) => (
                <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{enrollment.student.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {enrollment.course.title} • Vpisano: {new Date(enrollment.enrolledAt).toLocaleDateString('sl-SI')}
                    </p>
                    {enrollment.notes && (
                      <p className="text-sm text-muted-foreground mt-1">Opombe: {enrollment.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={enrollment.status === 'active' ? 'default' : 'secondary'}>
                      {enrollment.status === 'active' ? 'Aktiven' : enrollment.status}
                    </Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleUnenroll(enrollment.id)}
                      disabled={unenrollStudent.isPending}
                    >
                      Odstrani
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">Ni še nobenih vpisov.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    if (session.user.role !== 'TEACHER') {
      router.push('/dashboard/student');
      return;
    }
  }, [status, session, router]);

  // Mobile swipe navigation
  const navigationItems = [
    { id: 'overview', label: 'Pregled', icon: Home },
    { id: 'courses', label: 'Tečaji', icon: BookOpen },
    { id: 'enrollments', label: 'Vpisovanje', icon: UserCheck },
    { id: 'materials', label: 'Gradiva', icon: FileText },
    { id: 'students', label: 'Učenci', icon: Users },
    { id: 'groups', label: 'Skupine', icon: Users },
    { id: 'analytics', label: 'Analitika', icon: BarChart3 },
    { id: 'tools', label: 'Orodja', icon: Settings },
  ];

  const currentIndex = navigationItems.findIndex(item => item.id === activeSection);

  const handleSwipe = useSwipe({
    onSwipeLeft: () => {
      const nextIndex = (currentIndex + 1) % navigationItems.length;
      setActiveSection(navigationItems[nextIndex].id);
    },
    onSwipeRight: () => {
      const prevIndex = currentIndex === 0 ? navigationItems.length - 1 : currentIndex - 1;
      setActiveSection(navigationItems[prevIndex].id);
    },
  });

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  // While the effect handles redirecting, don't render the dashboard
  // when there's no session or the user isn't a teacher.
  if (!session) return null;
  if (session.user.role !== 'TEACHER') return null;

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection session={session} onNavigate={setActiveSection} />;
      case 'courses':
        return <CoursesSection />;
      case 'enrollments':
        return <EnrollmentSection />;
      case 'materials':
        return <MaterialsSection />;
      case 'students':
        return <StudentsSection />;
      case 'groups':
        return <GroupsSection />;
      case 'analytics':
        return <AnalyticsSection />;
      case 'advanced-analytics':
        return <AdvancedAnalyticsSection />;
      case 'automated-nudges':
        return <AutomatedNudgesSection />;
      case 'parents-portal':
        return <ParentsPortalSection />;
      case 'curriculum-planner':
        return <CurriculumPlannerSection />;
      // AI vpogled in AI pomočnik sta zdaj pod Orodja
      case 'plagiarism':
        return <PlagiarismDetectorSection />;
      case 'tools':
        return <ToolsSection />;
      default:
        return <OverviewSection session={session} onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden h-8 w-8 p-0"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
            <h1 className="text-lg sm:text-xl font-semibold text-card-foreground">AI Učni Portal</h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:block">
              <GlobalSearch />
            </div>
            <ThemeToggle />
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{session.user?.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <Badge variant="secondary" className="hidden sm:inline-flex">Učitelj</Badge>
            <Button variant="ghost" size="sm" className="h-8 px-2 sm:px-3" onClick={() => router.push('/api/auth/signout')}>
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Odjava</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <TeacherMobileNavigation
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navigationItems={navigationItems}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-t border-border">
        <div className="flex justify-around items-center py-2 px-2">
          {navigationItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl min-h-14 min-w-14 transition-all duration-200 touch-manipulation ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                    : 'text-muted-foreground hover:bg-accent/50 active:scale-95'
                }`}
              >
                <Icon className={`h-5 w-5 mb-1.5 ${
                  isActive ? 'scale-110' : ''
                }`} />
                <span className={`text-xs font-semibold leading-tight ${
                  isActive ? 'text-primary-foreground' : ''
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
          {/* More button for additional items */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center p-3 rounded-xl min-h-14 min-w-14 text-muted-foreground hover:bg-accent/50 active:scale-95 transition-all duration-200 touch-manipulation"
          >
            <svg className="h-5 w-5 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            <span className="text-xs font-semibold leading-tight">Več</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        </div>

        {/* Main Content with Swipe */}
        <main
          className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 min-h-[calc(100vh-80px)] pb-24 md:pb-0"
          {...handleSwipe}
        >
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
        <div className="flex justify-around items-center py-2 px-2">
          {navigationItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg min-h-12 min-w-12 transition-colors ${
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50'
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
          {/* More button for additional items */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center p-2 rounded-lg min-h-12 min-w-12 text-muted-foreground hover:bg-accent/50 transition-colors"
          >
            <svg className="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            <span className="text-xs font-medium">Več</span>
          </button>
        </div>
      </div>

      {/* Add bottom padding for mobile navigation */}
      <div className="md:hidden h-20"></div>
    </div>
  );
}
