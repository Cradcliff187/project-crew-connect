
import React from "react";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";

interface DropzoneProps {
  isDragging: boolean;
  dropzoneText: string;
  acceptedFileTypes: string;
  maxFileSize: number;
  onClick: () => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  isDragging,
  dropzoneText,
  acceptedFileTypes,
  maxFileSize,
  onClick
}) => {
  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
        isDragging
          ? "border-[#0485ea] bg-[#0485ea]/10"
          : "border-border hover:border-[#0485ea]/50 hover:bg-[#0485ea]/5"
      )}
      onClick={onClick}
    >
      <div className="flex flex-col items-center gap-2">
        <Upload className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">{dropzoneText}</p>
        <p className="text-xs text-muted-foreground">
          Accepted files: {acceptedFileTypes.replace(/\*/g, 'all')}
        </p>
        <p className="text-xs text-muted-foreground">
          Maximum file size: {maxFileSize}MB
        </p>
      </div>
    </div>
  );
};
