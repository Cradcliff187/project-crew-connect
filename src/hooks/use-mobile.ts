
import { useState, useEffect } from 'react';

/**
 * Hook to detect device capabilities such as camera, gps, etc.
 * This is useful for conditionally rendering UI elements based on device capabilities.
 */
export function useDeviceCapabilities() {
  const [hasCamera, setHasCamera] = useState(false);
  const [hasGPS, setHasGPS] = useState(false);

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
  
  return { hasCamera, hasGPS };
}
