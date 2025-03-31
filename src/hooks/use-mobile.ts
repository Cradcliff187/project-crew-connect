
import { useEffect, useState } from 'react';

interface DeviceCapabilities {
  isMobile: boolean;
  hasCamera: boolean;
  hasTouchscreen: boolean;
}

export function useDeviceCapabilities(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    isMobile: false,
    hasCamera: false,
    hasTouchscreen: false
  });

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return;
    }

    // Detect mobile device
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
      // Mobile or tablet user agent detection
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase()
      );
      // Additional check for screen size
      const isSmallScreen = window.innerWidth < 768;
      
      return isMobileDevice || isSmallScreen;
    };

    // Check for camera
    const checkCamera = () => {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    };

    // Check for touchscreen
    const checkTouchscreen = () => {
      return !!(
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 || 
        (window as any).DocumentTouch
      );
    };

    // Set capabilities
    setCapabilities({
      isMobile: checkMobile(),
      hasCamera: checkCamera(),
      hasTouchscreen: checkTouchscreen()
    });

    // Add resize listener to update isMobile status if window is resized
    const handleResize = () => {
      setCapabilities(prev => ({
        ...prev,
        isMobile: checkMobile()
      }));
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return capabilities;
}

// Simple hook for isMobile check only
export function useIsMobile(): boolean {
  const { isMobile } = useDeviceCapabilities();
  return isMobile;
}
