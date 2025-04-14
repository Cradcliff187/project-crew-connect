import { useState, useEffect } from 'react';

/**
 * Hook to detect if the current device is mobile based on screen width
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Listen for resize events
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

/**
 * Hook to detect device capabilities such as camera, gps, etc.
 * This is useful for conditionally rendering UI elements based on device capabilities.
 */
export function useDeviceCapabilities() {
  const [hasCamera, setHasCamera] = useState(false);
  const [hasGPS, setHasGPS] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check if device has camera
    const checkCamera = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        setHasCamera(false);
        return;
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasVideoInput = devices.some(device => device.kind === 'videoinput');
        setHasCamera(hasVideoInput);
      } catch (err) {
        console.error('Error detecting camera:', err);
        setHasCamera(false);
      }
    };

    // Check if device has GPS
    const checkGPS = () => {
      setHasGPS('geolocation' in navigator);
    };

    checkCamera();
    checkGPS();
  }, []);

  return { hasCamera, hasGPS, isMobile };
}
