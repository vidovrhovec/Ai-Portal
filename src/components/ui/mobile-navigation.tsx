'use client';

import { useState } from 'react';
import { Menu, Home, BookOpen, Users, Trophy, Brain, Settings, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { GlobalSearch } from '@/components/ui/global-search';
import { useNotificationStore } from '@/lib/notifications';
import { Session } from 'next-auth';

interface MobileNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  session: Session | null;
  unreadNotifications?: number;
}

const navigationItems = [
  { id: 'overview', label: 'Pregled', icon: Home },
  { id: 'learning', label: 'Učenje', icon: BookOpen },
  { id: 'social', label: 'Skupnost', icon: Users },
  { id: 'gamification', label: 'Dosežki', icon: Trophy },
  { id: 'ai', label: 'AI Pomočnik', icon: Brain },
  { id: 'settings', label: 'Nastavitve', icon: Settings },
];

export function MobileNavigation({
  activeSection,
  onSectionChange,
  session
}: MobileNavigationProps) {
  const { unreadCount } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleSectionChange = (sectionId: string) => {
    // Add haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    onSectionChange(sectionId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Odpri meni</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <div className="flex flex-col h-full">
                  {/* User Info */}
                  <div className="flex items-center space-x-3 p-4 border-b">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {session?.user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{session?.user?.name || 'Učenec'}</p>
                      <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                    </div>
                  </div>

                  {/* Navigation */}
                  <nav className="flex-1 px-4 py-6 space-y-2">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSectionChange(item.id)}
                          className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors ${
                            activeSection === item.id
                              ? 'bg-accent text-accent-foreground'
                              : 'text-muted-foreground hover:bg-accent/50'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>

                  {/* Footer */}
                  <div className="p-4 border-t">
                    <div className="flex items-center justify-between">
                      <ThemeToggle />
                      <Button variant="ghost" size="sm">
                        Odjava
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <h1 className="text-lg font-semibold">AI Portal</h1>
          </div>

          <div className="flex items-center space-x-2">
            <GlobalSearch />
            <Button variant="ghost" size="sm" className="p-2 relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
              <span className="sr-only">Obvestila</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-t safe-area-inset">
        <div className="flex items-center justify-center px-2 py-3">
          <div className="flex items-center space-x-1 bg-muted rounded-xl p-1 max-w-full overflow-x-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionChange(item.id)}
                  className={`flex flex-col items-center justify-center px-4 py-3 rounded-lg transition-all duration-200 min-w-16 min-h-16 touch-manipulation active:scale-95 ${
                    isActive
                      ? 'bg-background text-primary shadow-md scale-105'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }`}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`h-5 w-5 mb-1.5 transition-transform duration-200 ${
                    isActive ? 'scale-110' : ''
                  }`} />
                  <span className={`text-xs font-medium leading-tight transition-all duration-200 ${
                    isActive ? 'font-semibold' : ''
                  }`}>
                    {item.label}
                  </span>
                  {/* Active indicator dot */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add padding to account for fixed header/footer */}
      <div className="lg:hidden pt-16 pb-20" />
    </>
  );
}