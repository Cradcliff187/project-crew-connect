import React from 'react';
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
  // Simple file input ref for capturing images on mobile
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Handle file selection from camera
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onCapture(e.target.files[0]);
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
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
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
