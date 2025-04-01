
import { useState, useEffect, useRef } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const previousValueRef = useRef<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Skip debouncing if the value hasn't changed (deep equality check for objects/arrays)
    const hasValueChanged = JSON.stringify(previousValueRef.current) !== JSON.stringify(value);
    
    if (!hasValueChanged) {
      return;
    }
    
    // Update the previous value reference
    previousValueRef.current = value;
    
    // Clear any existing timeout to reset the debounce timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Update debounced value after delay
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
      timeoutRef.current = null;
    }, delay);

    // Cleanup function to clear timeout if component unmounts or value changes again
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}
