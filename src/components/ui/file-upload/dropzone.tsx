
import React from 'react';
import { cn } from "@/lib/utils";
import { Upload } from 'lucide-react';

interface DropzoneProps {
  isDragging: boolean;
  dropzoneText: string;
  acceptedFileTypes?: string;
  maxFileSize?: number;
  onClick: () => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  isDragging,
  dropzoneText,
  acceptedFileTypes,
  maxFileSize,
  onClick
}) => {
  // Format accepted file types for display
  const formatAcceptedTypes = () => {
    if (!acceptedFileTypes) return '';
    
    const types = acceptedFileTypes
      .split(',')
      .map(type => type.trim())
      .filter(Boolean)
      .map(type => {
        if (type === 'image/*') return 'images';
        if (type === 'application/pdf') return 'PDFs';
        if (type.includes('word')) return 'Word docs';
        if (type.includes('excel')) return 'Excel files';
        return type.replace('application/', '').replace('*', 'all');
      });
    
    return types.length > 0 ? `Accepts: ${types.join(', ')}` : '';
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center transition-colors hover:bg-muted/50 cursor-pointer",
        isDragging && "border-primary bg-muted/50"
      )}
      onClick={onClick}
    >
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className="rounded-full bg-muted p-2">
          <Upload className="h-6 w-6" />
        </div>
        <div className="text-sm font-medium">
          {dropzoneText}
        </div>
        <div className="text-xs text-muted-foreground">
          {formatAcceptedTypes()}
          {maxFileSize && <span>{maxFileSize}MB max</span>}
        </div>
      </div>
    </div>
  );
};
