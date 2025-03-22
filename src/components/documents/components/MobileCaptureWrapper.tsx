
import React from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MobileDocumentCapture from '../MobileDocumentCapture';

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
  if (!isMobile || !hasCamera) {
    return null;
  }

  return (
    <div className="space-y-4">
      {!showMobileCapture ? (
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setShowMobileCapture(true)}
          className="w-full flex items-center justify-center gap-2"
        >
          <Camera className="h-4 w-4" />
          Take Photo Instead
        </Button>
      ) : (
        <MobileDocumentCapture onCapture={onCapture} />
      )}
    </div>
  );
};

export default MobileCaptureWrapper;
