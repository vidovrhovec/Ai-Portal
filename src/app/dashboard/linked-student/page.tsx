'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Session } from 'next-auth';

// Types
/**
 * Student interface for linked-student dashboard
 * Represents a student in the collaborative learning context
 */
interface Student {
  id: string;
  name?: string;
  email: string;
}
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { GlobalSearch } from '@/components/ui/global-search';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, Users, MessageSquare, Trophy, Calendar, Brain, LogOut, Home, BarChart3, Settings } from 'lucide-react';

// Import components
import { StudyGroupsWithRoles } from '@/components/StudyGroupsWithRoles';
import { PeerReview } from '@/components/PeerReview';
import { AIChatHistory } from '@/components/AIChatHistory';

// Import hooks
import { useGroups, useStudents } from '@/hooks';

import { LucideIcon } from 'lucide-react';

// Quick Access Cards for Overview
/**
 * QuickAccessCard Component
 *
 * A reusable card component for dashboard quick actions.
 * Provides consistent styling and interaction patterns across dashboards.
 *
 * @param icon - Lucide icon component to display
 * @param title - Card title text
 * @param description - Descriptive text below the title
 * @param onClick - Click handler function
 * @param badge - Optional badge text to display
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
    <Card className={`cursor-pointer transition-all duration-200 ${colorClasses[color as keyof typeof colorClasses]}`} onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-white">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">{title}</h3>
              {badge && <Badge variant="secondary" className="text-xs">{badge}</Badge>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

// Sidebar Navigation Component
/**
 * Sidebar Component
 *
 * Navigation sidebar for the linked-student dashboard.
 * Provides section-based navigation with active state management.
 *
 * @param activeSection - Currently active section ID
 * @param onSectionChange - Handler for section changes
 */
function Sidebar({ activeSection, onSectionChange }: {
  activeSection: string;
  onSectionChange: (section: string) => void;
}) {
  const navigationItems = [
    { id: 'overview', label: 'Pregled', icon: Home },
    { id: 'groups', label: 'Skupine', icon: Users },
    { id: 'peers', label: 'Soošolci', icon: Users },
    { id: 'collaboration', label: 'Sodelovanje', icon: MessageSquare },
    { id: 'progress', label: 'Napredek', icon: BarChart3 },
    { id: 'tools', label: 'Orodja', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">Povezani učenci</h2>
        <p className="text-sm text-gray-600 mt-1">Skupinsko učenje</p>
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
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
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
/**
 * OverviewSection Component
 *
 * Main overview section displaying dashboard statistics and quick actions.
 * Shows welcome message, stats cards, and quick access cards.
 *
 * @param session - NextAuth session object (can be null)
 * @param onNavigate - Navigation handler for section changes
 */
function OverviewSection({ session, onNavigate }: { session: Session | null; onNavigate: (section: string) => void }) {
  const { data: groups } = useGroups();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Pregled</h1>
        <p className="text-muted-foreground">Dobrodošli v skupinsko učenje, {session?.user?.name}!</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Moje skupine</p>
                <p className="text-2xl font-bold">{groups?.length || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Soošolci</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Peer review</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dosežki</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <Trophy className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickAccessCard
          icon={Users}
          title="Pridruži se skupini"
          description="Najdi študijsko skupino"
          onClick={() => onNavigate('groups')}
          color="blue"
        />
        <QuickAccessCard
          icon={MessageSquare}
          title="Peer review"
          description="Oceni delo sošolcev"
          onClick={() => onNavigate('collaboration')}
          color="green"
        />
        <QuickAccessCard
          icon={Brain}
          title="AI pomočnik"
          description="Vprašaj za pomoč"
          onClick={() => onNavigate('tools')}
          color="purple"
        />
      </div>
    </div>
  );
}

// Groups Section
function GroupsSection({ session }: { session: Session | null }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Študijske skupine</h1>
        <p className="text-muted-foreground">Sodeluj z drugimi učenci</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Moje skupine</CardTitle>
          <CardDescription>Skupine, ki jih vodim ali v katerih sodelujem</CardDescription>
        </CardHeader>
        <CardContent>
          <StudyGroupsWithRoles userId={session?.user?.id || ''} />
        </CardContent>
      </Card>
    </div>
  );
}

// Peers Section
function PeersSection() {
  const { data: students } = useStudents();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Soošolci</h1>
        <p className="text-muted-foreground">Poveži se z drugimi učenci</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students?.slice(0, 6).map((student: Student) => (
          <Card key={student.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {student.name?.charAt(0)?.toUpperCase() || student.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-medium">{student.name || 'Brez imena'}</h3>
                  <p className="text-sm text-muted-foreground">{student.email}</p>
                  <Badge variant="secondary" className="mt-1">Soošolec</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )) || (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Ni soošolcev</h3>
              <p className="text-muted-foreground">Pridruži se skupini za povezovanje z drugimi učenci</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Collaboration Section
function CollaborationSection({ session }: { session: Session | null }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Sodelovanje</h1>
        <p className="text-muted-foreground">Sodeluj in pomaga drugim učencem</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Peer Review</CardTitle>
            <CardDescription>Oceni in komentiraj delo sošolcev</CardDescription>
          </CardHeader>
          <CardContent>
            <PeerReview userId={session?.user?.id || ''} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skupinske aktivnosti</CardTitle>
            <CardDescription>Trenutne skupinske naloge in projekti</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Ni aktivnih skupinskih nalog</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Progress Section
function ProgressSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Skupinski napredek</h1>
        <p className="text-muted-foreground">Sledi napredku skupine in primerjaj z drugimi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Moja učna pot</CardTitle>
            <CardDescription>Primerjava z skupino</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Moj napredek</span>
                <Badge variant="secondary">75%</Badge>
              </div>
              <Progress value={75} className="w-full" />
              <div className="flex justify-between items-center">
                <span className="text-sm">Povprečje skupine</span>
                <Badge variant="secondary">68%</Badge>
              </div>
              <Progress value={68} className="w-full" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dosežki skupine</CardTitle>
            <CardDescription>Skupinski dosežki in nagrade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Skupinski dosežki</span>
                <Badge variant="secondary">3</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Moji dosežki</span>
                <Badge variant="secondary">2</Badge>
              </div>
              <div className="text-center py-4">
                <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Odlično sodelovanje!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Tools Section
function ToolsSection({ session }: { session: Session | null }) { // eslint-disable-line @typescript-eslint/no-unused-vars
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Orodja</h1>
        <p className="text-muted-foreground">Orodja za skupinsko učenje</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-500" />
              <span>AI pomočnik</span>
            </CardTitle>
            <CardDescription>Vprašaj za pomoč pri skupinskem učenju</CardDescription>
          </CardHeader>
          <CardContent>
            <AIChatHistory />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-green-500" />
              <span>Skupinska komunikacija</span>
            </CardTitle>
            <CardDescription>Poveži se s sošolci</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Komunikacijska orodja kmalu na voljo</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LinkedStudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('overview');

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  if (session.user.role !== 'STUDENT') {
    router.push('/dashboard/teacher');
    return null;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection session={session} onNavigate={setActiveSection} />;
      case 'groups':
        return <GroupsSection session={session} />;
      case 'peers':
        return <PeersSection />;
      case 'collaboration':
        return <CollaborationSection session={session} />;
      case 'progress':
        return <ProgressSection />;
      case 'tools':
        return <ToolsSection session={session} />;
      default:
        return <OverviewSection session={session} onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">AI Učni Portal</h1>
          </div>
          <div className="flex items-center space-x-4">
            <GlobalSearch />
            <ThemeToggle />
            <Avatar>
              <AvatarFallback>{session.user?.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <Badge variant="secondary">Povezani učenec</Badge>
            <Button variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Odjava
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}