import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Custom hook for debounced navigation
export function useDebouncedNavigation() {
  const [isNavigating, setIsNavigating] = useState(false);
  
  const debouncedNavigate = (navigate: (path: string) => void, path: string) => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    navigate(path);
    
    // Reset after a short delay to prevent rapid navigation
    setTimeout(() => {
      setIsNavigating(false);
    }, 300);
  };
  
  return { debouncedNavigate, isNavigating };
}