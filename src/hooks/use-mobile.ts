
import { useState, useEffect } from 'react';

// The mobile breakpoint in pixels
const MOBILE_BREAKPOINT = 768;

/**
 * Hook that detects if the current device is mobile based on user agent and screen size
 */
export function useIsMobile() {
  // Only call hooks in the component context - check if window exists first
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Initial check: First check user agent, then screen size as fallback
    const checkMobile = () => {
      // First try user agent detection
      const userAgentIsMobile = checkUserAgentForMobile();
      
      // Then check screen width as fallback/additional signal
      const screenWidthIsMobile = window.innerWidth < MOBILE_BREAKPOINT;
      
      // Device is considered mobile if either condition is true
      setIsMobile(userAgentIsMobile || screenWidthIsMobile);
    };
    
    // Run check immediately
    checkMobile();
    
    // Set up event listeners for responsive design
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const handleResize = () => checkMobile();
    
    // Listen for screen size changes
    mql.addEventListener("change", handleResize);
    window.addEventListener("resize", handleResize);
    
    return () => {
      mql.removeEventListener("change", handleResize);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return isMobile;
}

/**
 * Hook that provides detailed device capabilities
 */
export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState({
    isMobile: false,
    hasCamera: false,
    hasLocation: false,
  });

  useEffect(() => {
    // Check if device is mobile
    const checkIsMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    // Check if device has camera
    const checkHasCamera = () => {
      return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
    };

    // Check if device has geolocation
    const checkHasLocation = () => {
      return 'geolocation' in navigator;
    };

    setCapabilities({
      isMobile: checkIsMobile(),
      hasCamera: checkHasCamera(),
      hasLocation: checkHasLocation(),
    });
  }, []);

  return capabilities;
}

/**
 * Helper function to detect mobile devices based on user agent
 */
const checkUserAgentForMobile = (): boolean => {
  if (typeof window === 'undefined' || !window.navigator) return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  
  // Regular expressions for mobile devices
  const mobileRegex = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i;
  const tabletRegex = /android|ipad|playbook|silk/i;
  
  // Check if touch is supported
  const hasTouchScreen = () => {
    if (typeof navigator === 'undefined') return false;
    return 'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0;
  };
  
  // Device is considered mobile if it matches mobile regex or is a tablet with touch
  return mobileRegex.test(userAgent) || 
    (tabletRegex.test(userAgent) && hasTouchScreen());
};

/**
 * Enhanced version of useDeviceCapabilities with additional features
 */
export function useEnhancedDeviceCapabilities() {
  const isMobile = useIsMobile();
  const [enhancedCapabilities, setEnhancedCapabilities] = useState({
    hasCamera: false,
    hasTouch: false,
    hasMicrophone: false
  });
  
  useEffect(() => {
    const detectCapabilities = async () => {
      // Check for touch support
      const hasTouch = 'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 || 
        (navigator as any).msMaxTouchPoints > 0;
      
      // Check for camera capability (permissions not requested yet)
      let hasCamera = false;
      try {
        hasCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getSupportedConstraints().deviceId);
      } catch (e) {
        console.log("Camera detection error:", e);
      }
      
      // Check for microphone capability
      let hasMicrophone = false;
      try {
        hasMicrophone = !!(navigator.mediaDevices && navigator.mediaDevices.getSupportedConstraints().deviceId);
      } catch (e) {
        console.log("Microphone detection error:", e);
      }
      
      setEnhancedCapabilities({
        hasCamera,
        hasTouch,
        hasMicrophone
      });
    };
    
    detectCapabilities();
  }, []);
  
  return { isMobile, ...enhancedCapabilities };
}
