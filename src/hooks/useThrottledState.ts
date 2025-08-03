import { useState, useCallback, useRef } from 'react';

export function useThrottledState<T>(
  initialState: T,
  delay: number = 100
): [T, (value: T) => void] {
  const [state, setState] = useState<T>(initialState);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const throttledSetState = useCallback((value: T) => {
    const now = Date.now();
    
    if (now - lastUpdateRef.current < delay) {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        setState(value);
        lastUpdateRef.current = Date.now();
      }, delay - (now - lastUpdateRef.current));
    } else {
      setState(value);
      lastUpdateRef.current = now;
    }
  }, [delay]);

  return [state, throttledSetState];
} 