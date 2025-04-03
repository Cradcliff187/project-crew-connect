
import { useState, useEffect } from 'react';

interface ScreenSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export function useScreenSize(): ScreenSize {
  const [screenSize, setScreenSize] = useState<ScreenSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isMobile: false,
    isTablet: false,
    isDesktop: true
  });

  useEffect(() => {
    // Initialize
    updateScreenSize();
    
    // Add event listener for window resize
    const handleResize = () => {
      updateScreenSize();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const updateScreenSize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    setScreenSize({
      width,
      height,
      isMobile: width < 640,
      isTablet: width >= 640 && width < 1024,
      isDesktop: width >= 1024
    });
  };

  return screenSize;
}
