
import * as React from "react";
import { cn } from "@/lib/utils";
import { Upload, Camera, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface FileUploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onFilesSelected: (files: File[]) => void;
  onFileClear?: (fileIndex: number) => void;
  selectedFiles?: File[];
  allowCamera?: boolean;
  allowMultiple?: boolean;
  acceptedFileTypes?: string;
  maxFileSize?: number; // in MB
  className?: string;
  dropzoneText?: string;
}

export const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  ({
    onFilesSelected,
    onFileClear,
    selectedFiles = [],
    allowCamera = true,
    allowMultiple = false,
    acceptedFileTypes = "image/*,application/pdf",
    maxFileSize = 10, // 10MB default
    className,
    dropzoneText = "Drag files here or click to upload",
    ...props
  }, ref) => {
    const isMobile = useIsMobile();
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [errors, setErrors] = React.useState<string[]>([]);

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const fileArray = Array.from(e.target.files);
        validateAndProcessFiles(fileArray);
      }
    };

    const validateAndProcessFiles = (files: File[]) => {
      setErrors([]);
      const newErrors: string[] = [];
      const validFiles = files.filter(file => {
        // Check file size
        if (file.size > maxFileSize * 1024 * 1024) {
          newErrors.push(`${file.name} exceeds maximum size of ${maxFileSize}MB`);
          return false;
        }
        
        // Check file type
        const fileType = file.type.toLowerCase();
        const acceptedTypes = acceptedFileTypes.split(',');
        const isValidType = acceptedTypes.some(type => {
          if (type.includes('*')) {
            return fileType.startsWith(type.split('/')[0]);
          }
          return type === fileType;
        });
        
        if (!isValidType) {
          newErrors.push(`${file.name} is not an accepted file type`);
          return false;
        }
        
        return true;
      });
      
      if (newErrors.length > 0) {
        setErrors(newErrors);
      }
      
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    const handleCameraCapture = () => {
      if (fileInputRef.current) {
        fileInputRef.current.capture = "environment";
        fileInputRef.current.accept = "image/*";
        fileInputRef.current.click();
      }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const fileArray = Array.from(e.dataTransfer.files);
        validateAndProcessFiles(fileArray);
      }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = () => {
      setIsDragging(false);
    };

    const removeFile = (index: number) => {
      if (onFileClear) {
        onFileClear(index);
      }
    };

    const handleClickUpload = () => {
      if (fileInputRef.current) {
        fileInputRef.current.capture = "";
        fileInputRef.current.accept = acceptedFileTypes;
        fileInputRef.current.click();
      }
    };

    return (
      <div className={cn("space-y-4", className)}>
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragging
              ? "border-[#0485ea] bg-[#0485ea]/10"
              : "border-border hover:border-[#0485ea]/50 hover:bg-[#0485ea]/5",
            className
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClickUpload}
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

        {errors.length > 0 && (
          <div className="text-destructive text-sm">
            {errors.map((error, i) => (
              <p key={i}>{error}</p>
            ))}
          </div>
        )}

        {allowCamera && isMobile && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCameraCapture} 
            className="w-full"
          >
            <Camera className="h-4 w-4 mr-2" />
            Take Photo
          </Button>
        )}

        <input
          type="file"
          ref={(e) => {
            // Assign to user-provided ref if available
            if (typeof ref === 'function') {
              ref(e);
            } else if (ref) {
              ref.current = e;
            }
            fileInputRef.current = e;
          }}
          className="hidden"
          multiple={allowMultiple}
          accept={acceptedFileTypes}
          onChange={handleFileInputChange}
          {...props}
        />

        {selectedFiles.length > 0 && (
          <div className="grid gap-2 mt-4">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between bg-muted p-3 rounded-md"
              >
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)}MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

FileUpload.displayName = "FileUpload";
