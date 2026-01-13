import { useRef, useState, useCallback, useEffect } from 'react';

export interface AnimationSettings {
  type: 'fade-in' | 'slide-in-left' | 'slide-in-right' | 'stagger-fade-in' | 'scale-in';
  duration?: number; // milliseconds, default 300
  delay?: number; // milliseconds, default 0
  easing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  staggerDelay?: number; // milliseconds between stagger items, default 100
}

export interface UseTemplateAnimationReturn {
  ref: React.RefObject<HTMLElement>;
  isAnimating: boolean;
  trigger: () => void;
}

export function useTemplateAnimation(settings: AnimationSettings): UseTemplateAnimationReturn {
  const ref = useRef<HTMLElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const delayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    type,
    duration = 300,
    delay = 0,
    easing = 'ease-out',
    staggerDelay = 100,
  } = settings;

  const applyAnimation = useCallback((element: HTMLElement) => {
    const transitionValue = `all ${duration}ms ${easing}`;

    // Step 1: Set initial state without transition
    element.style.transition = '';

    switch (type) {
      case 'fade-in':
        element.style.opacity = '0';
        break;
      case 'slide-in-left':
        element.style.opacity = '0';
        element.style.transform = 'translateX(-100px)';
        break;
      case 'slide-in-right':
        element.style.opacity = '0';
        element.style.transform = 'translateX(100px)';
        break;
      case 'scale-in':
        element.style.opacity = '0';
        element.style.transform = 'scale(0.8)';
        break;
      case 'stagger-fade-in':
        // Apply to all children
        Array.from(element.children).forEach((child) => {
          if (child instanceof HTMLElement) {
            child.style.opacity = '0';
            child.style.transition = '';
          }
        });
        break;
    }

    // Step 2: Set transition
    element.style.transition = transitionValue;

    // Step 3: Trigger animation to final state (using requestAnimationFrame for browser paint)
    requestAnimationFrame(() => {
      switch (type) {
        case 'fade-in':
          element.style.opacity = '1';
          break;
        case 'slide-in-left':
        case 'slide-in-right':
          element.style.opacity = '1';
          element.style.transform = 'translateX(0)';
          break;
        case 'scale-in':
          element.style.opacity = '1';
          element.style.transform = 'scale(1)';
          break;
        case 'stagger-fade-in':
          // Stagger children with configurable delay between each
          Array.from(element.children).forEach((child, index) => {
            if (child instanceof HTMLElement) {
              setTimeout(() => {
                child.style.transition = `opacity ${duration}ms ${easing}`;
                child.style.opacity = '1';
              }, index * staggerDelay);
            }
          });
          break;
      }
    });
  }, [type, duration, easing, staggerDelay]);

  const trigger = useCallback(() => {
    const element = ref.current;
    if (!element) {
      setIsAnimating(false);
      return;
    }

    // Clear any existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
    }

    setIsAnimating(true);

    // Apply animation after delay
    const startAnimation = () => {
      applyAnimation(element);

      // Mark animation as complete after duration
      timeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
      }, duration);
    };

    if (delay > 0) {
      delayTimeoutRef.current = setTimeout(startAnimation, delay);
    } else {
      startAnimation();
    }
  }, [applyAnimation, duration, delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
      }

      // Clear styles on cleanup
      const element = ref.current;
      if (element) {
        element.style.transition = '';
        element.style.opacity = '';
        element.style.transform = '';

        if (type === 'stagger-fade-in') {
          Array.from(element.children).forEach((child) => {
            if (child instanceof HTMLElement) {
              child.style.transition = '';
              child.style.opacity = '';
            }
          });
        }
      }
    };
  }, [type]);

  return {
    ref,
    isAnimating,
    trigger,
  };
}
