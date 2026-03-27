'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { GlobalSearch } from '@/components/ui/global-search';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Brain,
  MessageSquare,
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
  ChevronRight,
  Star,
  Clock,
  Award
} from 'lucide-react';

// Quick Access Cards for Overview
function QuickAccessCard({ icon: Icon, title, description, onClick, badge, color = "blue" }: {
  icon: React.ComponentType<{ className?: string }>;
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
function Sidebar({ activeSection, onSectionChange }: {
  activeSection: string;
  onSectionChange: (section: string) => void;
}) {
  const navigationItems = [
    { id: 'overview', label: 'Pregled', icon: Home, color: 'blue' },
    { id: 'learning', label: 'Učenje', icon: BookOpen, color: 'green' },
    { id: 'practice', label: 'Vadba', icon: Target, color: 'purple' },
    { id: 'social', label: 'Skupnost', icon: Users, color: 'orange' },
    { id: 'progress', label: 'Napredek', icon: TrendingUp, color: 'blue' },
    { id: 'tools', label: 'Orodja', icon: Zap, color: 'green' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
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
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
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
function OverviewSection({ onNavigate }: { onNavigate: (section: string) => void }) {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Dobrodošel nazaj!</h1>
        <p className="text-blue-100">Danes imaš 3 naloge za dokončati</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Aktivnih predmetov</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">85%</p>
                <p className="text-sm text-muted-foreground">Povprečni napredek</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-sm text-muted-foreground">Dosežki</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">2.5h</p>
                <p className="text-sm text-muted-foreground">Čas učenja danes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Hitri dostop</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAccessCard
            icon={FileText}
            title="Dodeljene naloge"
            description="3 naloge čakajo na rešitev"
            badge="3"
            color="blue"
            onClick={() => onNavigate('practice')}
          />
          <QuickAccessCard
            icon={Brain}
            title="Flashcards"
            description="Vadite s karticami"
            color="green"
            onClick={() => onNavigate('practice')}
          />
          <QuickAccessCard
            icon={Users}
            title="Študijske skupine"
            description="Pridružite se razpravam"
            color="purple"
            onClick={() => onNavigate('social')}
          />
          <QuickAccessCard
            icon={BarChart3}
            title="Pregled napredka"
            description="Sledite svojemu učenju"
            color="orange"
            onClick={() => onNavigate('progress')}
          />
          <QuickAccessCard
            icon={Zap}
            title="Fokus način"
            description="Brez motenj učenje"
            color="blue"
            onClick={() => onNavigate('tools')}
          />
          <QuickAccessCard
            icon={MessageSquare}
            title="AI pomočnik"
            description="Vprašajte za pomoč"
            color="green"
            onClick={() => onNavigate('tools')}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Zadnja aktivnost</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm">Dokončali ste kviz iz matematike</p>
              <span className="text-xs text-muted-foreground ml-auto">2h nazaj</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm">Pridružili ste se skupini &quot;Matematika 8. razred&quot;</p>
              <span className="text-xs text-muted-foreground ml-auto">5h nazaj</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <p className="text-sm">Osvojili ste dosežek &quot;Prvi koraki&quot;</p>
              <span className="text-xs text-muted-foreground ml-auto">1d nazaj</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Learning Section
function LearningSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Moji predmeti</h1>
        <p className="text-muted-foreground">Dostopajte do učnih gradiv in vsebin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Course cards would go here */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Matematika
              <Badge>8. razred</Badge>
            </CardTitle>
            <CardDescription>Osnove algebra in geometrije</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Napredek</span>
                <span>75%</span>
              </div>
              <Progress value={75} className="h-2" />
              <div className="flex justify-between">
                <Button variant="outline" size="sm">Ogled gradiv</Button>
                <Button size="sm">Začni učenje</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Slovenski jezik
              <Badge>8. razred</Badge>
            </CardTitle>
            <CardDescription>Literatura in slovnica</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Napredek</span>
                <span>60%</span>
              </div>
              <Progress value={60} className="h-2" />
              <div className="flex justify-between">
                <Button variant="outline" size="sm">Ogled gradiv</Button>
                <Button size="sm">Začni učenje</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Angleški jezik
              <Badge>8. razred</Badge>
            </CardTitle>
            <CardDescription>Grammar and vocabulary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Napredek</span>
                <span>45%</span>
              </div>
              <Progress value={45} className="h-2" />
              <div className="flex justify-between">
                <Button variant="outline" size="sm">Ogled gradiv</Button>
                <Button size="sm">Začni učenje</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Practice Section
function PracticeSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Vadba in testi</h1>
        <p className="text-muted-foreground">Izboljšajte svoje znanje s prakso</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dodeljene naloge</CardTitle>
            <CardDescription>3 naloge od učiteljev</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Assignment items would go here */}
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">Matematika - Kvadratne enačbe</p>
                  <p className="text-sm text-muted-foreground">Rok: danes</p>
                </div>
                <Badge variant="destructive">Novo</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Flashcards</CardTitle>
            <CardDescription>Vadite s karticami</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">12 kompletov kartic na voljo</p>
              <Button className="w-full">Začnite vadbo</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Social Section
function SocialSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Skupnost</h1>
        <p className="text-muted-foreground">Povežite se z drugimi učenci</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Študijske skupine</CardTitle>
            <CardDescription>Sodelujte z vrstniki</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>M8</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Matematika 8. razred</p>
                  <p className="text-sm text-muted-foreground">12 članov</p>
                </div>
              </div>
              <Button className="w-full">Pridruži se klepetu</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Peer Review</CardTitle>
            <CardDescription>Preglejte delo drugih</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">2 naloge za pregled</p>
              <Button variant="outline" className="w-full">Začnite pregled</Button>
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
        <h1 className="text-2xl font-bold mb-2">Moj napredek</h1>
        <p className="text-muted-foreground">Sledite svojemu učenju</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Skupni napredek</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Matematika</span>
                  <span>75%</span>
                </div>
                <Progress value={75} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Slovenski jezik</span>
                  <span>60%</span>
                </div>
                <Progress value={60} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Angleški jezik</span>
                  <span>45%</span>
                </div>
                <Progress value={45} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dosežki</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Award className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="font-medium">Prvi koraki</p>
                  <p className="text-sm text-muted-foreground">Dokončali prvi kviz</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Star className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium">Matematik</p>
                  <p className="text-sm text-muted-foreground">10 pravilnih odgovorov</p>
                </div>
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
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Učna orodja</h1>
        <p className="text-muted-foreground">Dodatna orodja za boljše učenje</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Zap className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-medium">Fokus način</h3>
                <p className="text-sm text-muted-foreground">Brez motenj učenje</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-medium">AI pomočnik</h3>
                <p className="text-sm text-muted-foreground">Vprašajte za pomoč</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div>
                <h3 className="font-medium">Načrtovalnik</h3>
                <p className="text-sm text-muted-foreground">Planirajte učenje</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-orange-500" />
              <div>
                <h3 className="font-medium">Video zapiski</h3>
                <p className="text-sm text-muted-foreground">Zabeležite pomembne dele</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Heart className="h-8 w-8 text-red-500" />
              <div>
                <h3 className="font-medium">Offline način</h3>
                <p className="text-sm text-muted-foreground">Učenje brez interneta</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Settings className="h-8 w-8 text-gray-500" />
              <div>
                <h3 className="font-medium">Nastavitve</h3>
                <p className="text-sm text-muted-foreground">Prilagodite izkušnjo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
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

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection onNavigate={setActiveSection} />;
      case 'learning':
        return <LearningSection />;
      case 'practice':
        return <PracticeSection />;
      case 'social':
        return <SocialSection />;
      case 'progress':
        return <ProgressSection />;
      case 'tools':
        return <ToolsSection />;
      default:
        return <OverviewSection onNavigate={setActiveSection} />;
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
            <Button variant="ghost" size="sm" onClick={() => router.push('/api/auth/signout')}>
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