'use client';

import { ReactNode, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface MobileInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
  required?: boolean;
  children?: ReactNode;
}

// Mobile-optimized input component
export const MobileInput = forwardRef<
  HTMLInputElement,
  MobileInputProps & React.InputHTMLAttributes<HTMLInputElement>
>(({ label, error, helperText, className, required, children, ...props }, ref) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={props.id} className="mobile-text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <div className="relative">
        <Input
          ref={ref}
          className={cn(
            'mobile-input',
            error && 'border-destructive focus-visible:ring-destructive',
            children && 'pr-12'
          )}
          {...props}
        />
        {children && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {children}
          </div>
        )}
      </div>
      {error && (
        <p className="mobile-text-xs text-destructive">{error}</p>
      )}
      {helperText && !error && (
        <p className="mobile-text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
});

MobileInput.displayName = 'MobileInput';

// Mobile-optimized textarea component
export const MobileTextarea = forwardRef<
  HTMLTextAreaElement,
  MobileInputProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ label, error, helperText, className, required, ...props }, ref) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={props.id} className="mobile-text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Textarea
        ref={ref}
        className={cn(
          'mobile-input min-h-24 resize-none',
          error && 'border-destructive focus-visible:ring-destructive'
        )}
        {...props}
      />
      {error && (
        <p className="mobile-text-xs text-destructive">{error}</p>
      )}
      {helperText && !error && (
        <p className="mobile-text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
});

MobileTextarea.displayName = 'MobileTextarea';

// Mobile-optimized button component
interface MobileButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  children: ReactNode;
  className?: string;
}

export const MobileButton = forwardRef<
  HTMLButtonElement,
  MobileButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>
>(({
  variant = 'default',
  size = 'default',
  fullWidth = false,
  loading = false,
  children,
  className,
  disabled,
  ...props
}, ref) => {
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        'mobile-button',
        fullWidth && 'w-full',
        loading && 'cursor-not-allowed opacity-70',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </Button>
  );
});

MobileButton.displayName = 'MobileButton';

// Mobile form section component
interface MobileFormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function MobileFormSection({
  title,
  description,
  children,
  className
}: MobileFormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="mobile-text-lg font-semibold">{title}</h3>
          )}
          {description && (
            <p className="mobile-text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

// Mobile form actions component
interface MobileFormActionsProps {
  children: ReactNode;
  className?: string;
  sticky?: boolean;
}

export function MobileFormActions({
  children,
  className,
  sticky = false
}: MobileFormActionsProps) {
  return (
    <div
      className={cn(
        'flex gap-3 pt-4',
        sticky && 'sticky bottom-0 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-t -mx-4 px-4 py-4 safe-area-inset',
        className
      )}
    >
      {children}
    </div>
  );
}