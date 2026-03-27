/**
 * Optimized Avatar component using Next.js Image
 * Handles user profile pictures with automatic optimization
 */

'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface OptimizedAvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: string;
}

const sizeMap = {
  sm: { width: 32, height: 32, className: 'h-8 w-8' },
  md: { width: 48, height: 48, className: 'h-12 w-12' },
  lg: { width: 64, height: 64, className: 'h-16 w-16' },
  xl: { width: 96, height: 96, className: 'h-24 w-24' },
};

export function OptimizedAvatar({
  src,
  alt = 'Avatar',
  size = 'md',
  className,
  fallback,
}: OptimizedAvatarProps) {
  const sizeConfig = sizeMap[size];
  const initials = fallback || alt.slice(0, 2).toUpperCase();

  if (!src) {
    return (
      <div
        className={cn(
          'rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium',
          sizeConfig.className,
          className
        )}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className={cn('rounded-full overflow-hidden relative', sizeConfig.className, className)}>
      <Image
        src={src}
        alt={alt}
        width={sizeConfig.width}
        height={sizeConfig.height}
        className="object-cover"
        priority={size === 'sm'}
        quality={85}
        sizes="(max-width: 768px) 32px, (max-width: 1024px) 48px, 64px"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
    </div>
  );
}
