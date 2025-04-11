
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface FileUploadFieldProps {
  control: Control<any>;
  name: string;
  maxFiles?: number;
  acceptedFileTypes?: Record<string, string[]>;
  maxSize?: number;
  label?: string;
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({
  control,
  name,
  maxFiles = 1,
  acceptedFileTypes,
  maxSize = 5 * 1024 * 1024, // 5MB default
  label = "Upload File"
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (...event: any[]) => void) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convert FileList to Array
      const filesArray = Array.from(e.target.files);
      
      // Check file size
      const oversizedFiles = filesArray.filter(file => file.size > maxSize);
      if (oversizedFiles.length > 0) {
        console.error(`File(s) exceed maximum size of ${maxSize / (1024 * 1024)}MB`);
        return;
      }
      
      // Limit number of files
      const selectedFiles = filesArray.slice(0, maxFiles);
      onChange(selectedFiles);
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field: { onChange, value, ...rest } }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => document.getElementById(`file-upload-${name}`)?.click()}
              >
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  {acceptedFileTypes ? Object.keys(acceptedFileTypes).join(', ') : 'Any file'} up to {formatBytes(maxSize)}
                </p>
                <input
                  id={`file-upload-${name}`}
                  type="file"
                  className="sr-only"
                  onChange={e => handleFileChange(e, onChange)}
                  accept={acceptedFileTypes ? Object.keys(acceptedFileTypes).join(',') : undefined}
                  multiple={maxFiles > 1}
                  {...rest}
                />
              </div>

              {value && value.length > 0 && (
                <div className="space-y-2">
                  {Array.isArray(value) && value.map((file: File, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                      <div className="flex items-center">
                        <span className="text-sm font-medium truncate max-w-xs">{file.name}</span>
                        <span className="ml-2 text-xs text-gray-500">{formatBytes(file.size)}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newFiles = [...value];
                          newFiles.splice(index, 1);
                          onChange(newFiles);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FileUploadField;
