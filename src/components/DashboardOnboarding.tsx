'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  BookOpen,
  Users,
  Brain,
  Trophy,
  MessageSquare,
  Settings
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: string;
  icon: React.ReactNode;
  target?: string; // CSS selector for highlighting
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface DashboardOnboardingProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
  userRole: 'STUDENT' | 'TEACHER';
}

const studentSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Your Learning Dashboard!',
    description: 'Let\'s take a quick tour of your personalized learning space.',
    content: 'This dashboard is designed to help you learn effectively with AI-powered tools, gamification, and collaborative features.',
    icon: <BookOpen className="h-6 w-6" />,
    position: 'center'
  },
  {
    id: 'courses',
    title: 'Your Courses',
    description: 'Access all your enrolled courses and materials.',
    content: 'Browse your courses, view materials, and track your progress. Each course includes interactive content and AI-generated study aids.',
    icon: <BookOpen className="h-6 w-6" />,
    target: '[data-onboarding="courses"]',
    position: 'bottom'
  },
  {
    id: 'ai-assistant',
    title: 'AI Learning Assistant',
    description: 'Get help with any topic using our AI assistant.',
    content: 'Ask questions, generate study materials, or get explanations in simple terms. The AI adapts to your learning style.',
    icon: <Brain className="h-6 w-6" />,
    target: '[data-onboarding="ai-assistant"]',
    position: 'right'
  },
  {
    id: 'gamification',
    title: 'Earn Points & Achievements',
    description: 'Stay motivated with our gamification system.',
    content: 'Complete tasks, earn points, and unlock achievements. Track your learning streak and compete with friends!',
    icon: <Trophy className="h-6 w-6" />,
    target: '[data-onboarding="gamification"]',
    position: 'left'
  },
  {
    id: 'groups',
    title: 'Study Groups',
    description: 'Connect and learn with other students.',
    content: 'Join study groups, share knowledge, and collaborate on projects. Learning is better together!',
    icon: <Users className="h-6 w-6" />,
    target: '[data-onboarding="groups"]',
    position: 'top'
  },
  {
    id: 'flashcards',
    title: 'Smart Flashcards',
    description: 'Master concepts with AI-generated flashcards.',
    content: 'Generate flashcards from your materials and review them with spaced repetition for better retention.',
    icon: <BookOpen className="h-6 w-6" />,
    target: '[data-onboarding="flashcards"]',
    position: 'bottom'
  },
  {
    id: 'personalization',
    title: 'Customize Your Dashboard',
    description: 'Make it your own learning space.',
    content: 'Personalize your dashboard layout, show/hide widgets, and adjust settings to match your learning preferences.',
    icon: <Settings className="h-6 w-6" />,
    target: '[data-onboarding="personalization"]',
    position: 'right'
  }
];

const teacherSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Your Teaching Dashboard!',
    description: 'Discover tools to enhance your teaching experience.',
    content: 'Manage students, create content, and leverage AI to create engaging learning experiences.',
    icon: <BookOpen className="h-6 w-6" />,
    position: 'center'
  },
  {
    id: 'students',
    title: 'Student Management',
    description: 'Monitor and support your students\' progress.',
    content: 'View student profiles, track performance, assign tests, and provide personalized feedback.',
    icon: <Users className="h-6 w-6" />,
    target: '[data-onboarding="students"]',
    position: 'bottom'
  },
  {
    id: 'content-creation',
    title: 'AI-Powered Content Creation',
    description: 'Generate high-quality educational materials instantly.',
    content: 'Use AI to create quizzes, study guides, and interactive content tailored to your curriculum.',
    icon: <Brain className="h-6 w-6" />,
    target: '[data-onboarding="content-creation"]',
    position: 'right'
  },
  {
    id: 'analytics',
    title: 'Learning Analytics',
    description: 'Gain insights into student performance.',
    content: 'View detailed analytics, identify learning patterns, and make data-driven teaching decisions.',
    icon: <Trophy className="h-6 w-6" />,
    target: '[data-onboarding="analytics"]',
    position: 'left'
  },
  {
    id: 'communication',
    title: 'Class Communication',
    description: 'Keep your class connected and engaged.',
    content: 'Send announcements, facilitate discussions, and create collaborative learning environments.',
    icon: <MessageSquare className="h-6 w-6" />,
    target: '[data-onboarding="communication"]',
    position: 'top'
  }
];

export function DashboardOnboarding({
  isVisible,
  onComplete,
  onSkip,
  userRole
}: DashboardOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = userRole === 'STUDENT' ? studentSteps : teacherSteps;

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding-completed', 'true');
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding-skipped', 'true');
    onSkip();
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      >
        {/* Highlight overlay for targeted elements */}
        {step.target && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0"
          >
            {/* This would highlight the target element - implementation depends on specific layout */}
          </motion.div>
        )}

        {/* Onboarding Card */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <Card className="w-full max-w-lg mx-auto shadow-2xl">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      key={step.id}
                      initial={{ rotate: -180, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="p-2 bg-blue-100 rounded-lg"
                    >
                      {step.icon}
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-lg">{step.title}</h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Content */}
                <motion.div
                  key={currentStep}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6"
                >
                  <p className="text-gray-700 leading-relaxed">{step.content}</p>
                </motion.div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Step {currentStep + 1} of {steps.length}</span>
                    <span>{Math.round(progress)}% complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-blue-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Step Indicators */}
                <div className="flex justify-center gap-2 mb-6">
                  {steps.map((_, index) => (
                    <motion.div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                      animate={{
                        scale: index === currentStep ? 1.2 : 1,
                      }}
                      transition={{ duration: 0.2 }}
                    />
                  ))}
                </div>

                {/* Actions */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={handleSkip}>
                      Skip Tour
                    </Button>
                    <Button onClick={handleNext} className="gap-2">
                      {currentStep === steps.length - 1 ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Get Started
                        </>
                      ) : (
                        <>
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}