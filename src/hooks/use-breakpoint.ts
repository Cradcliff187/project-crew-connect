import { useEffect, useState } from 'react';

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpointValues = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

type ReturnType = {
  isAboveSm: boolean;
  isAboveMd: boolean;
  isAboveLg: boolean;
  isAboveXl: boolean;
  isAbove2Xl: boolean;
  current: Breakpoint | null;
};

export default function useBreakpoint(targetBreakpoint?: Breakpoint): ReturnType {
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    // Skip this effect when running on server
    if (typeof window === 'undefined') return;

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    // Set initial size
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine current breakpoint
  const getCurrentBreakpoint = (): Breakpoint | null => {
    if (typeof window === 'undefined') return null;

    if (windowWidth >= breakpointValues['2xl']) return '2xl';
    if (windowWidth >= breakpointValues.xl) return 'xl';
    if (windowWidth >= breakpointValues.lg) return 'lg';
    if (windowWidth >= breakpointValues.md) return 'md';
    if (windowWidth >= breakpointValues.sm) return 'sm';
    return null;
  };

  // Check if we're above a specific breakpoint
  const isAbove = (breakpoint: Breakpoint): boolean => {
    if (typeof window === 'undefined') return false;
    return windowWidth >= breakpointValues[breakpoint];
  };

  return {
    isAboveSm: isAbove('sm'),
    isAboveMd: isAbove('md'),
    isAboveLg: isAbove('lg'),
    isAboveXl: isAbove('xl'),
    isAbove2Xl: isAbove('2xl'),
    current: getCurrentBreakpoint(),
  };
}
