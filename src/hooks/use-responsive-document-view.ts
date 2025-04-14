import { useState, useEffect } from 'react';

export type ViewMode = 'grid' | 'list' | 'compact';

interface UseResponsiveDocumentViewOptions {
  defaultView?: ViewMode;
  breakpoints?: {
    compact: number;
    list: number;
    grid: number;
  };
}

export function useResponsiveDocumentView(options: UseResponsiveDocumentViewOptions = {}) {
  const {
    defaultView = 'grid',
    breakpoints = {
      compact: 640, // sm
      list: 768, // md
      grid: 1024, // lg
    },
  } = options;

  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [autoView, setAutoView] = useState<ViewMode | null>(null);
  const [isAutoViewEnabled, setIsAutoViewEnabled] = useState(false);

  // Handle window resize for auto switching view modes
  useEffect(() => {
    if (!isAutoViewEnabled) return;

    const handleResize = () => {
      const width = window.innerWidth;

      if (width < breakpoints.compact) {
        setAutoView('compact');
      } else if (width < breakpoints.list) {
        setAutoView('list');
      } else {
        setAutoView('grid');
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => {
      window.addEventListener('resize', handleResize);
    };
  }, [isAutoViewEnabled, breakpoints]);

  // Apply auto view if enabled
  useEffect(() => {
    if (isAutoViewEnabled && autoView) {
      setViewMode(autoView);
    }
  }, [autoView, isAutoViewEnabled]);

  const toggleAutoView = () => {
    setIsAutoViewEnabled(prev => !prev);
  };

  return {
    viewMode,
    setViewMode,
    isAutoViewEnabled,
    toggleAutoView,
    autoView,
  };
}
