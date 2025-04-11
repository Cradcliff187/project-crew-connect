
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { Control } from 'react-hook-form';
import { DocumentUploadFormValues } from '../schemas/documentSchema';
import { FileIcon, UploadIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface DropzoneUploaderProps {
  control: Control<DocumentUploadFormValues>;
  onFileSelect: (files: File[]) => void;
  previewURL?: string | null;
  watchFiles?: File[];
  label?: string;
}

const DropzoneUploader = ({
  control,
  onFileSelect,
  previewURL,
  watchFiles,
  label = "Upload File"
}: DropzoneUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      onFileSelect(files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onFileSelect(files);
    }
  };

  const handleRemoveFile = () => {
    onFileSelect([]);
  };

  return (
    <FormField
      control={control}
      name="files"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div
              className={cn(
                "border-2 border-dashed rounded-md transition-colors",
                isDragging 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-300 bg-gray-50/50 hover:bg-gray-100/50",
                "cursor-pointer"
              )}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                type="file"
                className="sr-only"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
                id="file-upload"
              />
              
              {watchFiles && watchFiles.length > 0 ? (
                <div className="p-4">
                  {previewURL ? (
                    <div className="relative mb-4">
                      <img 
                        src={previewURL} 
                        alt="Preview" 
                        className="max-h-48 mx-auto object-contain rounded border" 
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7"
                        onClick={handleRemoveFile}
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 py-3 px-4 rounded border mb-4">
                      <FileIcon className="h-8 w-8 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {watchFiles[0].name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(watchFiles[0].size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-red-500"
                        onClick={handleRemoveFile}
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="text-center">
                    <label 
                      htmlFor="file-upload" 
                      className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      Change file
                    </label>
                  </div>
                </div>
              ) : (
                <label 
                  htmlFor="file-upload" 
                  className="flex flex-col items-center justify-center p-6 cursor-pointer"
                >
                  <UploadIcon className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700">
                    Drag & drop your file here, or <span className="text-blue-600">browse</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports images, PDFs, and common document formats (max 15MB)
                  </p>
                </label>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DropzoneUploader;
