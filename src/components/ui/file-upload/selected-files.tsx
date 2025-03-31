
import React from "react";
import { Button } from "@/components/ui/button";
import { File, X } from "lucide-react";

interface SelectedFilesProps {
  files: File[];
  onRemoveFile: (index: number) => void;
}

export const SelectedFiles: React.FC<SelectedFilesProps> = ({ 
  files, 
  onRemoveFile
}) => {
  if (files.length === 0) return null;

  return (
    <div className="grid gap-2 mt-4">
      {files.map((file, index) => (
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
              onRemoveFile(index);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};
