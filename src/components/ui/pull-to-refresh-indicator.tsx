'use client';

interface PullToRefreshIndicatorProps {
  isRefreshing: boolean;
  pullDistance: number;
  threshold: number;
  className?: string;
}

export function PullToRefreshIndicator({
  isRefreshing,
  pullDistance,
  threshold,
  className = ''
}: PullToRefreshIndicatorProps) {
  const progress = Math.min(pullDistance / threshold, 1);
  const shouldShow = pullDistance > 10 || isRefreshing;

  if (!shouldShow) return null;

  return (
    <div
      className={`absolute top-0 left-0 right-0 z-10 flex items-center justify-center py-4 bg-background/95 backdrop-blur transition-transform duration-200 ${className}`}
      style={{
        transform: `translateY(${Math.max(-100 + progress * 100, -100)}%)`
      }}
    >
      <div className="flex items-center space-x-3">
        {isRefreshing ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm font-medium">Osvežujem...</span>
          </>
        ) : (
          <>
            <div
              className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center transition-colors"
              style={{
                background: progress >= 1 ? 'hsl(var(--primary))' : 'transparent'
              }}
            >
              <div
                className="h-2 w-2 rounded-full transition-colors"
                style={{
                  background: progress >= 1 ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))'
                }}
              />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {progress >= 1 ? 'Spusti za osvežitev' : 'Povleci za osvežitev'}
            </span>
          </>
        )}
      </div>
    </div>
  );
}