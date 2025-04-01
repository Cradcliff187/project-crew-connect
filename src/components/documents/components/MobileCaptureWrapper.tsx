
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

interface MobileCaptureWrapperProps {
  onCapture: (file: File) => void;
  isMobile: boolean;
  hasCamera: boolean;
  showMobileCapture: boolean;
  setShowMobileCapture: (show: boolean) => void;
}

const MobileCaptureWrapper: React.FC<MobileCaptureWrapperProps> = ({
  onCapture,
  isMobile,
  hasCamera,
  showMobileCapture,
  setShowMobileCapture
}) => {
  // Use ref instead of direct DOM access
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file selection from camera
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Mobile camera capture file change triggered');
    if (e.target.files && e.target.files.length > 0) {
      console.log('File captured from mobile camera:', e.target.files[0].name);
      onCapture(e.target.files[0]);
    }
  };
  
  // Handle camera button click
  const handleCameraClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Camera button clicked, activating input via ref');
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error('Could not access camera input ref');
    }
  };
  
  // If this is a mobile device with a camera, show the capture button
  if (isMobile && hasCamera) {
    return (
      <div>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleCameraClick}
        >
          <Camera className="h-4 w-4 mr-2" />
          Take Photo
        </Button>
        
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    );
  }
  
  // Otherwise, don't render anything
  return null;
};

export default MobileCaptureWrapper;
