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
import { useSwipe } from '@/hooks/useSwipe';

// Import admin-specific components
import { AdminSettingsSection as AdminSettingsSectionComponent } from './settings/page';
import { AdminUsersSection as AdminUsersSectionComponent } from './users/page';

// Import icons
import {
  Users,
  BookOpen,
  Database,
  Settings,
  LogOut,
  Home,
  BarChart3,
  ArrowLeftRight,
  Puzzle,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronRight,
  Crown,
  UserCheck,
  DatabaseIcon,
  Cog,
  TrendingUp,
  Download,
  Upload
} from 'lucide-react';

// Mobile Navigation Component for Admin
function AdminMobileNavigation({
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
              <h2 className="text-xl font-bold text-foreground">Admin panel</h2>
              <p className="text-sm text-muted-foreground">Popoln nadzor sistema</p>
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
                Admin Panel v1.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick Access Cards for Admin Overview
function AdminQuickAccessCard({ icon: Icon, title, description, onClick, badge, color = "blue" }: {
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
    orange: "border-orange-200 bg-orange-50 hover:bg-orange-100",
    red: "border-red-200 bg-red-50 hover:bg-red-100"
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
function AdminSidebar({ activeSection, onSectionChange }: {
  activeSection: string;
  onSectionChange: (section: string) => void;
}) {
  const navigationItems = [
    { id: 'overview', label: 'Pregled', icon: Home },
    { id: 'users', label: 'Uporabniki', icon: Users },
    { id: 'courses', label: 'Tečaji', icon: BookOpen },
    { id: 'database', label: 'Baza podatkov', icon: Database },
    { id: 'settings', label: 'Nastavitve', icon: Settings },
    { id: 'analytics', label: 'Analitika', icon: BarChart3 },
    { id: 'migrations', label: 'Migracije', icon: ArrowLeftRight },
    { id: 'plugins', label: 'Vtičniki', icon: Puzzle },
  ];

  return (
    <div className="w-64 bg-card border-r border-border h-full">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <Crown className="h-6 w-6 text-yellow-500" />
          <div>
            <h2 className="text-lg font-semibold text-card-foreground">Admin panel</h2>
            <p className="text-sm text-muted-foreground">Popoln nadzor</p>
          </div>
        </div>
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
function AdminOverviewSection({ session, onNavigate }: { session: Session | null; onNavigate: (section: string) => void }) {
  // Mock data for overview - will be replaced with real API calls
  const systemStats = {
    totalUsers: 150,
    activeUsers: 89,
    totalCourses: 24,
    databaseSize: '2.4 GB',
    uptime: '99.9%',
    lastBackup: '2 ure nazaj'
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Admin pregled</h1>
        <p className="text-muted-foreground">Dobrodošli v admin panel, {session?.user?.name}! Tukaj imate popoln nadzor nad sistemom.</p>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">Status sistema</p>
                <p className="text-lg font-bold text-green-700">Online</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Uptime</p>
                <p className="text-lg font-bold text-blue-700">{systemStats.uptime}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-900">Zadnja varnostna kopija</p>
                <p className="text-sm font-bold text-orange-700">{systemStats.lastBackup}</p>
              </div>
              <Download className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="touch-manipulation hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Skupaj uporabnikov</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{systemStats.totalUsers}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-50 rounded-lg shrink-0">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="touch-manipulation hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Aktivni uporabniki</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{systemStats.activeUsers}</p>
              </div>
              <div className="p-2 sm:p-3 bg-green-50 rounded-lg shrink-0">
                <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="touch-manipulation hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Tečaji</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{systemStats.totalCourses}</p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-50 rounded-lg shrink-0">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="touch-manipulation hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Velikost baze</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{systemStats.databaseSize}</p>
              </div>
              <div className="p-2 sm:p-3 bg-orange-50 rounded-lg shrink-0">
                <DatabaseIcon className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <AdminQuickAccessCard
          icon={Users}
          title="Upravljanje uporabnikov"
          description="CRUD operacije za vse uporabnike"
          onClick={() => onNavigate('users')}
          color="blue"
        />
        <AdminQuickAccessCard
          icon={Database}
          title="Konfiguracija baze"
          description="Nastavi tip baze in povezave"
          onClick={() => onNavigate('database')}
          color="green"
        />
        <AdminQuickAccessCard
          icon={Settings}
          title="Sistemske nastavitve"
          description="Self-registration, email, varnost"
          onClick={() => onNavigate('settings')}
          color="purple"
        />
        <AdminQuickAccessCard
          icon={BarChart3}
          title="Analitika sistema"
          description="Statistika in poročila"
          onClick={() => onNavigate('analytics')}
          color="orange"
        />
        <AdminQuickAccessCard
          icon={ArrowLeftRight}
          title="Migracije"
          description="Export/import konfiguracije"
          onClick={() => onNavigate('migrations')}
          color="red"
        />
        <AdminQuickAccessCard
          icon={Shield}
          title="Varnostni pregled"
          description="Audit log in varnostne nastavitve"
          onClick={() => onNavigate('security')}
          color="red"
        />
      </div>

      {/* Security Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-900">Varnostno opozorilo</h3>
              <p className="text-sm text-yellow-800 mt-1">
                Admin panel je omogočen. Ne pozabite ga onemogočiti z <code>npm run admin:disable</code> ko končate z administriranjem.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboard() {
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
    if (session.user.role !== 'ADMIN') {
      router.push('/dashboard/student');
      return;
    }
  }, [status, session, router]);

  // Mobile swipe navigation
  const navigationItems = [
    { id: 'overview', label: 'Pregled', icon: Home },
    { id: 'users', label: 'Uporabniki', icon: Users },
    { id: 'courses', label: 'Tečaji', icon: BookOpen },
    { id: 'database', label: 'Baza', icon: Database },
    { id: 'settings', label: 'Nastavitve', icon: Settings },
    { id: 'analytics', label: 'Analitika', icon: BarChart3 },
    { id: 'migrations', label: 'Migracije', icon: ArrowLeftRight },
    { id: 'plugins', label: 'Vtičniki', icon: Puzzle },
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
  // when there's no session or the user isn't an admin.
  if (!session) return null;
  if (session.user.role !== 'ADMIN') return null;

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <AdminOverviewSection session={session} onNavigate={setActiveSection} />;
      case 'users':
        return <AdminUsersSection />;
      case 'courses':
        return <AdminCoursesSection />;
      case 'database':
        return <AdminDatabaseSection />;
      case 'settings':
        return <AdminSettingsSection />;
      case 'analytics':
        return <AdminAnalyticsSection />;
      case 'migrations':
        return <AdminMigrationsSection />;
      case 'plugins':
        return <AdminPluginsSection />;
      default:
        return <AdminOverviewSection session={session} onNavigate={setActiveSection} />;
    }
  };

  // Placeholder components for sections not yet implemented
  function AdminUsersSection() {
    return <AdminUsersSectionComponent />;
  }

  function AdminCoursesSection() {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Upravljanje tečajev</h1>
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Upravljanje tečajev</h3>
            <p className="text-muted-foreground">Upravljanje tečajev bo implementirano kmalu.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  function AdminDatabaseSection() {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Konfiguracija baze podatkov</h1>
        <Card>
          <CardContent className="text-center py-12">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Konfiguracija baze</h3>
            <p className="text-muted-foreground">Nastavitve baze podatkov bodo implementirane kmalu.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  function AdminSettingsSection() {
    return <AdminSettingsSectionComponent />;
  }

  function AdminAnalyticsSection() {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Analitika sistema</h1>
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Analitika sistema</h3>
            <p className="text-muted-foreground">Sistemska analitika bo implementirana kmalu.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  function AdminMigrationsSection() {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Migracije in varnostne kopije</h1>
        <Card>
          <CardContent className="text-center py-12">
            <ArrowLeftRight className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Migracije</h3>
            <p className="text-muted-foreground">Migracije in backup-i bodo implementirani kmalu.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  function AdminPluginsSection() {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Upravljanje vtičnikov</h1>
        <Card>
          <CardContent className="text-center py-12">
            <Puzzle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Vtičniki</h3>
            <p className="text-muted-foreground">Sistem vtičnikov bo implementiran kmalu.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <div className="flex items-center space-x-3">
              <Crown className="h-6 w-6 text-yellow-500" />
              <h1 className="text-lg sm:text-xl font-semibold text-card-foreground">Admin Panel</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:block">
              <GlobalSearch />
            </div>
            <ThemeToggle />
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{session.user?.name?.[0] || 'A'}</AvatarFallback>
            </Avatar>
            <Badge variant="secondary" className="hidden sm:inline-flex bg-yellow-100 text-yellow-800">
              <Crown className="h-3 w-3 mr-1" />
              Admin
            </Badge>
            <Button variant="ghost" size="sm" className="h-8 px-2 sm:px-3" onClick={() => router.push('/api/auth/signout')}>
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Odjava</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AdminMobileNavigation
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navigationItems={navigationItems}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main Content */}
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
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

      {/* Add bottom padding for mobile navigation */}
      <div className="md:hidden h-20"></div>
    </div>
  );
}