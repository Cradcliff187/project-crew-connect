
import React from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraButtonProps {
  onCameraCapture: () => void;
}

export const CameraButton: React.FC<CameraButtonProps> = ({
  onCameraCapture
}) => {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onCameraCapture}
      className="w-full flex items-center justify-center gap-2"
    >
      <Camera className="h-4 w-4" />
      <span>Take Photo</span>
    </Button>
  );
};
