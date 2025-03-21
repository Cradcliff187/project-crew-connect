
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
  setShowMobileCapture,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onCapture(file);
      
      // Reset the input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!isMobile || !hasCamera) {
    return null;
  }

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        onClick={() => setShowMobileCapture(true)}
        className="w-full flex items-center justify-center text-[#0485ea]"
      >
        <Camera className="h-4 w-4 mr-2" />
        Take a Photo
      </Button>
      
      {showMobileCapture && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCapture}
          className="hidden"
          onClick={() => setShowMobileCapture(false)}
        />
      )}
    </div>
  );
};

export default MobileCaptureWrapper;
