
import { File, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SelectedFilesProps {
  files: File[];
  onRemoveFile: (index: number) => void;
}

export function SelectedFiles({ files, onRemoveFile }: SelectedFilesProps) {
  if (files.length === 0) return null;

  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Selected Files</h4>
      <ul className="space-y-2">
        {files.map((file, i) => (
          <li 
            key={`${file.name}-${i}`} 
            className="flex items-center justify-between p-2 rounded-md border bg-background"
          >
            <div className="flex items-center gap-2">
              <File className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium truncate max-w-[200px]" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveFile(i)}
              className="rounded-full p-1 h-6 w-6"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
