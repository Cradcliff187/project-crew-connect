
import React from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface CameraButtonProps {
  onCameraCapture: () => void;
}

export const CameraButton: React.FC<CameraButtonProps> = ({ onCameraCapture }) => {
  return (
    <Button 
      type="button" 
      variant="outline" 
      onClick={onCameraCapture} 
      className="w-full"
    >
      <Camera className="h-4 w-4 mr-2" />
      Take Photo
    </Button>
  );
};
