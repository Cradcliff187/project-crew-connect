
import { useState, useEffect } from 'react';

interface DeviceCapabilities {
  isMobile: boolean;
  hasCamera: boolean;
  hasLocation: boolean;
}

export function useDeviceCapabilities(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
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
