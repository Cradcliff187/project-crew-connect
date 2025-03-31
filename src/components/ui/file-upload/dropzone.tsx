
import { cn } from "@/lib/utils";
import { UploadCloud } from "lucide-react";

interface DropzoneProps {
  isDragging: boolean;
  dropzoneText: string;
  acceptedFileTypes: string;
  maxFileSize: number;
  onClick: () => void;
}

export function Dropzone({
  isDragging,
  dropzoneText,
  acceptedFileTypes,
  maxFileSize,
  onClick
}: DropzoneProps) {
  // Format accepted file types for display
  const formattedTypes = acceptedFileTypes
    .split(',')
    .map(type => type.replace('*', '').replace('application/', '').replace('image/', ''))
    .filter(Boolean)
    .join(', ');
  
  return (
    <div
      onClick={onClick}
      className={cn(
        "border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer transition-colors",
        isDragging 
          ? "border-primary bg-primary/5" 
          : "border-input hover:border-primary/50 hover:bg-muted/50"
      )}
    >
      <UploadCloud className="h-10 w-10 mb-2 text-muted-foreground" />
      <p className="text-sm font-medium">{dropzoneText}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {formattedTypes && `Accepts: ${formattedTypes}`}
        {maxFileSize && ` (Max: ${maxFileSize}MB)`}
      </p>
    </div>
  );
}
