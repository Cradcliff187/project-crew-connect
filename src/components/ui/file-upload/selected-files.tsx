
import React from 'react';
import { X, FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SelectedFilesProps {
  files: File[];
  onRemoveFile: (index: number) => void;
}

export const SelectedFiles: React.FC<SelectedFilesProps> = ({
  files,
  onRemoveFile
}) => {
  if (!files.length) return null;
  
  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="mt-4 space-y-2">
      <div className="text-sm font-medium">Selected Files:</div>
      <div className="space-y-2">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="flex items-center justify-between rounded-md border bg-background p-2"
          >
            <div className="flex items-center space-x-2">
              <div className="shrink-0">
                <FileIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={() => onRemoveFile(index)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
