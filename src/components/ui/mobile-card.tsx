'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MobileCardProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
}

export function MobileCard({
  title,
  description,
  icon,
  children,
  className,
  onClick,
  variant = 'default',
  size = 'md'
}: MobileCardProps) {
  const baseClasses = 'mobile-card touch-manipulation transition-all duration-200';

  const variantClasses = {
    default: 'hover:shadow-md active:scale-[0.98]',
    elevated: 'shadow-lg hover:shadow-xl active:scale-[0.98]',
    outlined: 'border-2 hover:border-primary/50 active:scale-[0.98]'
  };

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const interactiveClasses = onClick ? 'cursor-pointer' : '';

  return (
    <Card
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        interactiveClasses,
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {(title || description || icon) && (
        <CardHeader className="pb-3 px-0">
          <div className="flex items-start space-x-3">
            {icon && (
              <div className="flex-shrink-0 mt-1">
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {title && (
                <CardTitle className="mobile-heading line-clamp-2 text-left">
                  {title}
                </CardTitle>
              )}
              {description && (
                <CardDescription className="mobile-text mt-1 line-clamp-2">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className="pt-0 px-0">
        {children}
      </CardContent>
    </Card>
  );
}

// Specialized mobile card variants
export function MobileActionCard({
  title,
  description,
  icon,
  action,
  className,
  ...props
}: MobileCardProps & { action?: ReactNode }) {
  return (
    <MobileCard
      className={cn('flex items-center justify-between', className)}
      {...props}
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="font-medium mobile-text line-clamp-1">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {description}
            </p>
          )}
        </div>
      </div>
      {action && (
        <div className="flex-shrink-0 ml-3">
          {action}
        </div>
      )}
    </MobileCard>
  );
}

export function MobileStatsCard({
  title,
  value,
  change,
  icon,
  className,
  ...props
}: {
  title: string;
  value: string | number;
  change?: {
    value: number;
    label: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  icon?: ReactNode;
  className?: string;
} & Omit<MobileCardProps, 'title' | 'children'>) {
  return (
    <MobileCard className={className} {...props}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="flex-shrink-0">
              {icon}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <p className="text-2xl font-bold">
              {value}
            </p>
            {change && (
              <p className={cn(
                'text-xs font-medium',
                change.type === 'positive' && 'text-green-600',
                change.type === 'negative' && 'text-red-600',
                change.type === 'neutral' && 'text-muted-foreground'
              )}>
                {change.type === 'positive' && '+'}
                {change.value}% {change.label}
              </p>
            )}
          </div>
        </div>
      </div>
    </MobileCard>
  );
}