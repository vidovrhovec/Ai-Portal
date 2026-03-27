'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Grid3X3,
  List,
  Eye,
  EyeOff,
  Palette,
  Layout,
  Save,
  RotateCcw
} from 'lucide-react';

interface DashboardLayout {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface WidgetVisibility {
  courses: boolean;
  materials: boolean;
  quizzes: boolean;
  groups: boolean;
  gamification: boolean;
  aiAssistant: boolean;
  knowledgeHeatmap: boolean;
  flashcards: boolean;
}

interface DashboardPersonalizationProps {
  onLayoutChange?: (layout: string) => void;
  onWidgetVisibilityChange?: (widgets: WidgetVisibility) => void;
  'data-onboarding'?: string;
}

const layouts: DashboardLayout[] = [
  {
    id: 'grid',
    name: 'Grid Layout',
    description: 'Organized cards in a responsive grid',
    icon: 'Grid3X3'
  },
  {
    id: 'compact',
    name: 'Compact Layout',
    description: 'Space-efficient layout with smaller cards',
    icon: 'List'
  },
  {
    id: 'focus',
    name: 'Focus Layout',
    description: 'Minimal layout highlighting key metrics',
    icon: 'Eye'
  }
];

const defaultWidgetVisibility: WidgetVisibility = {
  courses: true,
  materials: true,
  quizzes: true,
  groups: true,
  gamification: true,
  aiAssistant: true,
  knowledgeHeatmap: true,
  flashcards: true
};

export function DashboardPersonalization({
  onLayoutChange,
  onWidgetVisibilityChange,
  'data-onboarding': dataOnboarding
}: DashboardPersonalizationProps) {
  const [selectedLayout, setSelectedLayout] = useState(() => {
    if (typeof window === 'undefined') return 'grid';
    return localStorage.getItem('dashboard-layout') || 'grid';
  });
  const [widgetVisibility, setWidgetVisibility] = useState<WidgetVisibility>(() => {
    if (typeof window === 'undefined') return defaultWidgetVisibility;
    const savedWidgets = localStorage.getItem('dashboard-widgets');
    if (savedWidgets) {
      try {
        const parsed = JSON.parse(savedWidgets);
        return { ...defaultWidgetVisibility, ...parsed };
      } catch (error) {
        console.error('Failed to parse saved widget preferences:', error);
        return defaultWidgetVisibility;
      }
    }
    return defaultWidgetVisibility;
  });
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleLayoutChange = (layoutId: string) => {
    setSelectedLayout(layoutId);
    setHasUnsavedChanges(true);
  };

  const handleWidgetToggle = (widget: keyof WidgetVisibility) => {
    const newVisibility = {
      ...widgetVisibility,
      [widget]: !widgetVisibility[widget]
    };
    setWidgetVisibility(newVisibility);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    localStorage.setItem('dashboard-layout', selectedLayout);
    localStorage.setItem('dashboard-widgets', JSON.stringify(widgetVisibility));

    onLayoutChange?.(selectedLayout);
    onWidgetVisibilityChange?.(widgetVisibility);

    setHasUnsavedChanges(false);
    setIsOpen(false);
  };

  const handleReset = () => {
    setSelectedLayout('grid');
    setWidgetVisibility(defaultWidgetVisibility);
    setHasUnsavedChanges(true);
  };

  const getVisibleWidgetsCount = () => {
    return Object.values(widgetVisibility).filter(Boolean).length;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" data-onboarding={dataOnboarding}>
          <Settings className="h-4 w-4" />
          Customize Dashboard
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="ml-1">
              Unsaved
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Dashboard Personalization
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Layout Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Layout Style
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {layouts.map((layout) => (
                  <motion.div
                    key={layout.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedLayout === layout.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleLayoutChange(layout.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded ${
                          selectedLayout === layout.id ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          {layout.icon === 'Grid3X3' && <Grid3X3 className="h-5 w-5" />}
                          {layout.icon === 'List' && <List className="h-5 w-5" />}
                          {layout.icon === 'Eye' && <Eye className="h-5 w-5" />}
                        </div>
                        <div>
                          <h4 className="font-medium">{layout.name}</h4>
                          <p className="text-sm text-gray-600">{layout.description}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Widget Visibility */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Widget Visibility
                <Badge variant="outline" className="ml-auto">
                  {getVisibleWidgetsCount()} / {Object.keys(widgetVisibility).length} visible
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {Object.entries(widgetVisibility).map(([widget, isVisible]) => (
                  <motion.div
                    key={widget}
                    className="flex items-center justify-between p-3 border rounded-lg"
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                  >
                    <div className="flex items-center gap-3">
                      {isVisible ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                      <Label htmlFor={widget} className="capitalize cursor-pointer">
                        {widget.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                    </div>
                    <Switch
                      id={widget}
                      checked={isVisible}
                      onCheckedChange={() => handleWidgetToggle(widget as keyof WidgetVisibility)}
                    />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset to Default
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}