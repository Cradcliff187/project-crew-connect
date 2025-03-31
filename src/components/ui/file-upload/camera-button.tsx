
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraButtonProps {
  onCameraCapture: () => void;
}

export function CameraButton({ onCameraCapture }: CameraButtonProps) {
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
}
