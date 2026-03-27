'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  BookOpen,
  Users,
  FileText,
  Brain,
  Search,
  MessageSquare,
  Trophy,
  TrendingUp,
  Sparkles
} from 'lucide-react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'minimal' | 'card';
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
  className = ''
}: EmptyStateProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { scale: 1, rotate: 0 }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  if (variant === 'minimal') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`flex flex-col items-center justify-center py-8 text-center ${className}`}
      >
        <motion.div
          variants={iconVariants}
          transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
          className="text-gray-400 mb-3"
        >
          {icon}
        </motion.div>
        <motion.h3
          variants={contentVariants}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-sm font-medium text-gray-900 mb-1"
        >
          {title}
        </motion.h3>
        <motion.p
          variants={contentVariants}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-xs text-gray-500"
        >
          {description}
        </motion.p>
      </motion.div>
    );
  }

  if (variant === 'card') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <Card className={`text-center ${className}`}>
          <CardContent className="pt-6">
            <motion.div variants={iconVariants} className="mx-auto text-gray-400 mb-4">
              {icon}
            </motion.div>
            <motion.h3
              variants={contentVariants}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="text-lg font-semibold text-gray-900 mb-2"
            >
              {title}
            </motion.h3>
            <motion.p
              variants={contentVariants}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="text-gray-600 mb-4"
            >
              {description}
            </motion.p>
            {action && (
              <motion.div
                variants={contentVariants}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <Button onClick={action.onClick} variant={action.variant || 'default'}>
                  {action.label}
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      <motion.div
        variants={iconVariants}
        className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6"
      >
        <div className="text-gray-400">
          {icon}
        </div>
      </motion.div>

      <motion.div
        variants={contentVariants}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 mb-6 max-w-md">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {action && (
            <Button onClick={action.onClick} variant={action.variant || 'default'} className="gap-2">
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} variant="outline" className="gap-2">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Specific empty state components for dashboard sections

export function EmptyCoursesState({ onCreateCourse, onBrowseCourses }: {
  onCreateCourse?: () => void;
  onBrowseCourses?: () => void;
}) {
  return (
    <EmptyState
      icon={<BookOpen className="h-8 w-8" />}
      title="No courses yet"
      description="Start your learning journey by enrolling in courses or creating your own study materials."
      action={onCreateCourse ? {
        label: 'Create Course',
        onClick: onCreateCourse
      } : undefined}
      secondaryAction={onBrowseCourses ? {
        label: 'Browse Courses',
        onClick: onBrowseCourses
      } : undefined}
    />
  );
}

export function EmptyMaterialsState({ onCreateMaterial, onGenerateWithAI }: {
  onCreateMaterial?: () => void;
  onGenerateWithAI?: () => void;
}) {
  return (
    <EmptyState
      icon={<FileText className="h-8 w-8" />}
      title="No study materials"
      description="Create study guides, notes, or let AI generate comprehensive materials for your courses."
      action={onGenerateWithAI ? {
        label: 'Generate with AI',
        onClick: onGenerateWithAI
      } : undefined}
      secondaryAction={onCreateMaterial ? {
        label: 'Add Material',
        onClick: onCreateMaterial
      } : undefined}
    />
  );
}

export function EmptyGroupsState({ onCreateGroup, onJoinGroup }: {
  onCreateGroup?: () => void;
  onJoinGroup?: () => void;
}) {
  return (
    <EmptyState
      icon={<Users className="h-8 w-8" />}
      title="No study groups yet"
      description="Connect with other learners, share knowledge, and study together in collaborative groups."
      action={onCreateGroup ? {
        label: 'Create Group',
        onClick: onCreateGroup
      } : undefined}
      secondaryAction={onJoinGroup ? {
        label: 'Join Group',
        onClick: onJoinGroup
      } : undefined}
    />
  );
}

export function EmptyQuizzesState({ onCreateQuiz, onGenerateQuiz }: {
  onCreateQuiz?: () => void;
  onGenerateQuiz?: () => void;
}) {
  return (
    <EmptyState
      icon={<Brain className="h-8 w-8" />}
      title="No quizzes available"
      description="Test your knowledge with interactive quizzes or create custom assessments for your students."
      action={onGenerateQuiz ? {
        label: 'Generate Quiz',
        onClick: onGenerateQuiz
      } : undefined}
      secondaryAction={onCreateQuiz ? {
        label: 'Create Quiz',
        onClick: onCreateQuiz
      } : undefined}
    />
  );
}

export function EmptyAchievementsState({ onViewProgress }: {
  onViewProgress?: () => void;
}) {
  return (
    <EmptyState
      icon={<Trophy className="h-8 w-8" />}
      title="No achievements yet"
      description="Start learning to unlock achievements and earn points. Every step counts towards your learning journey!"
      action={onViewProgress ? {
        label: 'View Progress',
        onClick: onViewProgress
      } : undefined}
      variant="card"
    />
  );
}

export function EmptyMessagesState({ onStartConversation }: {
  onStartConversation?: () => void;
}) {
  return (
    <EmptyState
      icon={<MessageSquare className="h-8 w-8" />}
      title="No messages yet"
      description="Connect with your study group or reach out to your teacher. Communication helps learning!"
      action={onStartConversation ? {
        label: 'Start Conversation',
        onClick: onStartConversation
      } : undefined}
      variant="minimal"
    />
  );
}

export function EmptyAnalyticsState({ onViewInsights }: {
  onViewInsights?: () => void;
}) {
  return (
    <EmptyState
      icon={<TrendingUp className="h-8 w-8" />}
      title="No data to analyze"
      description="Once students start learning, you'll see detailed analytics and insights here."
      action={onViewInsights ? {
        label: 'View Insights',
        onClick: onViewInsights
      } : undefined}
      variant="card"
    />
  );
}

// Special empty state for first-time users
export function WelcomeEmptyState({ onStartTour, onExploreFeatures }: {
  onStartTour?: () => void;
  onExploreFeatures?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="text-center py-16 px-4"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-6"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Your Learning Hub!
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Discover AI-powered tools, gamification, and collaborative features designed to enhance your learning experience.
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        {onStartTour && (
          <Button onClick={onStartTour} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Take a Quick Tour
          </Button>
        )}
        {onExploreFeatures && (
          <Button onClick={onExploreFeatures} variant="outline" className="gap-2">
            <Search className="h-4 w-4" />
            Explore Features
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}