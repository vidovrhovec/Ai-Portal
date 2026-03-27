import { useEffect, useRef } from 'react';

interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
  minSwipeDistance?: number;
  maxSwipeTime?: number;
  longPressDelay?: number;
  preventScrollOnSwipe?: boolean;
}

export function useSwipe(options: SwipeOptions) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onLongPress,
    minSwipeDistance = 50,
    maxSwipeTime = 300,
    longPressDelay = 500,
    preventScrollOnSwipe = false
  } = options;

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const isSwipeRef = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
      isSwipeRef.current = false;

      // Set up long press timer
      if (onLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          onLongPress?.();
          // Clear touch start to prevent swipe detection
          touchStartRef.current = null;
        }, longPressDelay);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // If moved significantly, it's a swipe - cancel long press
      if (absDeltaX > 10 || absDeltaY > 10) {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        isSwipeRef.current = true;

        // Prevent scroll if swipe detected and option enabled
        if (preventScrollOnSwipe && (absDeltaX > minSwipeDistance || absDeltaY > minSwipeDistance)) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // Clear long press timer
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const touchEnd = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };

      const deltaX = touchEnd.x - touchStartRef.current.x;
      const deltaY = touchEnd.y - touchStartRef.current.y;
      const deltaTime = touchEnd.time - touchStartRef.current.time;

      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Check if it's a tap (no significant movement)
      if (!isSwipeRef.current && absDeltaX < 10 && absDeltaY < 10 && deltaTime < 300) {
        onTap?.();
      }
      // Check if it's a swipe
      else if (deltaTime <= maxSwipeTime && (absDeltaX > minSwipeDistance || absDeltaY > minSwipeDistance)) {
        // Determine if it's a horizontal or vertical swipe
        if (absDeltaX > absDeltaY) {
          // Horizontal swipe
          if (deltaX > 0) {
            onSwipeRight?.();
          } else {
            onSwipeLeft?.();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0) {
            onSwipeDown?.();
          } else {
            onSwipeUp?.();
          }
        }
      }

      touchStartRef.current = null;
      isSwipeRef.current = false;
    };

    const handleTouchCancel = () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      touchStartRef.current = null;
      isSwipeRef.current = false;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, onLongPress, minSwipeDistance, maxSwipeTime, longPressDelay, preventScrollOnSwipe]);

  return elementRef;
}