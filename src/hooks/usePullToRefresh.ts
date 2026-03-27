import { useEffect, useRef, useState } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  maxPullDistance?: number;
  refreshThreshold?: number;
}

export function usePullToRefresh(options: PullToRefreshOptions) {
  const {
    onRefresh,
    threshold = 80,
    maxPullDistance = 120,
    refreshThreshold = 60
  } = options;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let isAtTop = false;
    let hasTriggeredRefresh = false;

    const checkIfAtTop = () => {
      isAtTop = element.scrollTop === 0;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!isAtTop || isRefreshing) return;

      const touch = e.touches[0];
      setStartY(touch.clientY);
      setIsPulling(true);
      hasTriggeredRefresh = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || isRefreshing) return;

      const touch = e.touches[0];
      const deltaY = touch.clientY - startY;

      // Only allow pulling down
      if (deltaY > 0) {
        const distance = Math.min(deltaY * 0.5, maxPullDistance);
        setPullDistance(distance);

        // Prevent default scrolling when pulling
        if (distance > threshold) {
          e.preventDefault();
        }

        // Trigger refresh when threshold is reached
        if (distance >= refreshThreshold && !hasTriggeredRefresh) {
          hasTriggeredRefresh = true;
          setIsRefreshing(true);
          const refreshPromise = onRefresh();
          if (refreshPromise && typeof refreshPromise.then === 'function') {
            refreshPromise.finally(() => {
              setIsRefreshing(false);
              setPullDistance(0);
              setIsPulling(false);
            });
          } else {
            setIsRefreshing(false);
            setPullDistance(0);
            setIsPulling(false);
          }
        }
      }
    };

    const handleTouchEnd = () => {
      if (!isPulling) return;

      setIsPulling(false);

      // If not refreshing, animate back to top
      if (!isRefreshing) {
        setPullDistance(0);
      }
    };

    const handleScroll = () => {
      checkIfAtTop();
    };

    // Initial check
    checkIfAtTop();

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('scroll', handleScroll);
    };
  }, [onRefresh, threshold, maxPullDistance, refreshThreshold, isRefreshing, isPulling, startY]);

  return {
    elementRef,
    isRefreshing,
    pullDistance,
    isPulling
  };
}