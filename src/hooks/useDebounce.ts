
import { useState, useEffect, useRef } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const previousValueRef = useRef<T>(value);
  
  useEffect(() => {
    // Skip debouncing if the value hasn't changed (deep equality check for objects/arrays)
    const hasValueChanged = JSON.stringify(previousValueRef.current) !== JSON.stringify(value);
    
    if (!hasValueChanged) {
      return;
    }
    
    // Update the previous value reference
    previousValueRef.current = value;
    
    // Update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timeout if value changes or component unmounts
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
