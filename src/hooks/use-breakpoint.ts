
import { useEffect, useState } from 'react';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type BreakpointMap = Record<Breakpoint, number>;

const breakpointMap: BreakpointMap = {
  'xs': 0,
  'sm': 640,
  'md': 768,
  'lg': 1024,
  'xl': 1280,
  '2xl': 1536,
};

// Export a named function and a default export for compatibility
export function useBreakpoint(breakpoint: Breakpoint = 'md'): boolean {
  const [isAboveBreakpoint, setIsAboveBreakpoint] = useState<boolean>(false);

  useEffect(() => {
    // Function to check if window width is above the specified breakpoint
    const checkWidth = () => {
      if (typeof window === 'undefined') return;
      const width = window.innerWidth;
      setIsAboveBreakpoint(width >= breakpointMap[breakpoint]);
    };

    // Check initially
    checkWidth();

    // Add resize listener
    window.addEventListener('resize', checkWidth);

    // Cleanup listener
    return () => window.removeEventListener('resize', checkWidth);
  }, [breakpoint]);

  return isAboveBreakpoint;
}

// Export default for direct imports
export default useBreakpoint;
