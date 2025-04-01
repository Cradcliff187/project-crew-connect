
import { useState, useEffect, useRef } from 'react';

/**
 * A custom hook that delays updating a value until a specified delay has passed
 * Used to prevent excessive re-renders or API calls when values change rapidly
 * 
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const previousValueRef = useRef<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Skip debouncing if the value hasn't changed
    // Use JSON.stringify for deep comparison of objects/arrays
    // This prevents unnecessary state updates for complex objects
    let hasValueChanged = false;
    
    try {
      hasValueChanged = JSON.stringify(previousValueRef.current) !== JSON.stringify(value);
    } catch (e) {
      // If values can't be stringified (e.g., contain circular references),
      // fall back to reference comparison
      hasValueChanged = previousValueRef.current !== value;
    }
    
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
