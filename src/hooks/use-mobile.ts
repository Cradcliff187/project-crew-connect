
import { useEffect, useState } from 'react';

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check initially
    checkIfMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  return isMobile;
}

export function useDeviceCapabilities() {
  const [hasCamera, setHasCamera] = useState(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Check if device has camera capability
    const checkCameraCapability = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          setHasCamera(false);
          return;
        }
        
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasVideoInput = devices.some(device => device.kind === 'videoinput');
        setHasCamera(hasVideoInput);
      } catch (error) {
        console.error('Error checking camera capability:', error);
        setHasCamera(false);
      }
    };
    
    checkCameraCapability();
  }, []);
  
  return { isMobile, hasCamera };
}
