'use client';

import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Animation variants for common patterns
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 }
};

export const slideInFromBottom = {
  initial: { opacity: 0, y: 100 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 100 }
};

// Stagger animation for lists
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

// Hover animations
export const hoverLift = {
  scale: 1.02,
  y: -2,
  transition: { duration: 0.2 }
};

export const hoverGlow = {
  boxShadow: '0 0 20px rgba(59, 130, 246, 0.15)',
  transition: { duration: 0.2 }
};

// Click animations
export const tapShrink = {
  scale: 0.95,
  transition: { duration: 0.1 }
};

// Loading animations
export const pulse = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export const spin = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

// Page transition wrapper
export function PageTransition({ children, className = '' }: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Animated counter for stats
export function AnimatedCounter({
  value,
  duration = 1000,
  className = ''
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const [count, setCount] = useState(0);
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const startValue = 0;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      setCount(Math.floor(startValue + (value - startValue) * progress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, isInView]);

  return (
    <span ref={nodeRef} className={className}>
      {count.toLocaleString()}
    </span>
  );
}

// Animated progress bar
export function AnimatedProgressBar({
  value,
  max = 100,
  className = '',
  showValue = true,
  color = 'blue'
}: {
  value: number;
  max?: number;
  className?: string;
  showValue?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}) {
  const percentage = Math.min((value / max) * 100, 100);
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      width: `${percentage}%`,
      transition: { duration: 1, ease: 'easeOut' }
    });
  }, [percentage, controls]);

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600',
    purple: 'bg-purple-600'
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className={`h-2 rounded-full ${colorClasses[color]}`}
          initial={{ width: 0 }}
          animate={controls}
        />
      </div>
      {showValue && (
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}

// Animated list with staggered entrance
export function AnimatedList({
  items,
  renderItem,
  className = ''
}: {
  items: unknown[];
  renderItem: (item: unknown, index: number) => React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={className}
    >
      {items.map((item, index) => (
        <motion.div key={index} variants={staggerItem}>
          {renderItem(item, index)}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Notification toast with animation
export function AnimatedToast({
  message,
  type = 'info',
  onClose,
  duration = 5000
}: {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg max-w-sm ${typeStyles[type]}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{message}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="ml-2 h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Achievement unlock animation
export function AchievementUnlock({
  title,
  description,
  icon,
  onComplete
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onComplete: () => void;
}) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          >
            <Card className="text-center p-8 max-w-sm mx-4">
              <CardContent>
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                  className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  {icon}
                </motion.div>
                <motion.h3
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-bold text-gray-900 mb-2"
                >
                  Achievement Unlocked!
                </motion.h3>
                <motion.h4
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg font-semibold text-yellow-600 mb-2"
                >
                  {title}
                </motion.h4>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-gray-600"
                >
                  {description}
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hover effect wrapper for interactive elements
export function HoverEffect({
  children,
  className = '',
  type = 'lift'
}: {
  children: React.ReactNode;
  className?: string;
  type?: 'lift' | 'glow' | 'scale';
}) {
  const variants = {
    lift: hoverLift,
    glow: hoverGlow,
    scale: { scale: 1.05, transition: { duration: 0.2 } }
  };

  return (
    <motion.div
      whileHover={variants[type]}
      whileTap={tapShrink}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Loading skeleton with shimmer effect
export function ShimmerSkeleton({
  className = '',
  lines = 3
}: {
  className?: string;
  lines?: number;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          className="h-4 bg-gray-200 rounded"
          animate={{
            background: [
              'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
              'linear-gradient(90deg, #f3f4f6 25%, #f3f4f6 50%, #e5e7eb 75%)'
            ]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{
            backgroundSize: '200% 100%'
          }}
        />
      ))}
    </div>
  );
}

// Floating action button with animation
export function FloatingActionButton({
  icon,
  onClick,
  className = '',
  badge
}: {
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
  badge?: string | number;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`fixed bottom-6 right-6 z-40 ${className}`}
    >
      <Button
        onClick={onClick}
        size="lg"
        className="h-14 w-14 rounded-full shadow-lg relative"
      >
        {icon}
        {badge && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {badge}
          </Badge>
        )}
      </Button>
    </motion.div>
  );
}