
import React from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

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
      className="flex items-center gap-2 w-full"
    >
      <Camera className="h-4 w-4" />
      Take Photo
    </Button>
  );
};
