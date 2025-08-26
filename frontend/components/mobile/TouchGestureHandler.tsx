'use client';

import { useEffect, useRef, useState } from 'react';

interface TouchGestureHandlerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  minSwipeDistance?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
  className?: string;
}

export default function TouchGestureHandler({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onTap,
  onDoubleTap,
  onLongPress,
  minSwipeDistance = 50,
  longPressDelay = 500,
  doubleTapDelay = 300,
  className = ''
}: TouchGestureHandlerProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastTapTime, setLastTapTime] = useState<number>(0);
  const [isLongPress, setIsLongPress] = useState<boolean>(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setTouchEnd(null);
    setIsLongPress(false);

    // 开始长按计时器
    if (onLongPress) {
      const timer = setTimeout(() => {
        setIsLongPress(true);
        onLongPress();
      }, longPressDelay);
      setLongPressTimer(timer);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // 如果移动距离过大，取消长按
    if (touchStart && longPressTimer) {
      const touch = e.touches[0];
      const distance = Math.sqrt(
        Math.pow(touch.clientX - touchStart.x, 2) + 
        Math.pow(touch.clientY - touchStart.y, 2)
      );
      
      if (distance > 10) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // 清除长按计时器
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    // 如果不是长按，处理其他手势
    if (!isLongPress) {
      const touch = e.changedTouches[0];
      setTouchEnd({ x: touch.clientX, y: touch.clientY });

      // 处理点击
      if (onTap || onDoubleTap) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTapTime;
        
        if (tapLength < doubleTapDelay && tapLength > 0) {
          // 双击
          if (onDoubleTap) {
            onDoubleTap();
          }
        } else {
          // 单击
          if (onTap) {
            onTap();
          }
        }
        setLastTapTime(currentTime);
      }
    }
  };

  useEffect(() => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
    const isVerticalSwipe = Math.abs(distanceY) > Math.abs(distanceX);

    if (isHorizontalSwipe && Math.abs(distanceX) > minSwipeDistance) {
      if (distanceX > 0 && onSwipeLeft) {
        onSwipeLeft();
      } else if (distanceX < 0 && onSwipeRight) {
        onSwipeRight();
      }
    }

    if (isVerticalSwipe && Math.abs(distanceY) > minSwipeDistance) {
      if (distanceY > 0 && onSwipeUp) {
        onSwipeUp();
      } else if (distanceY < 0 && onSwipeDown) {
        onSwipeDown();
      }
    }

    // 重置触摸状态
    setTouchStart(null);
    setTouchEnd(null);
  }, [touchEnd, touchStart, minSwipeDistance, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  // 清理计时器
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);

  return (
    <div
      ref={elementRef}
      className={`touch-gesture-handler ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'manipulation' }} // 优化触摸响应
    >
      {children}
    </div>
  );
}
