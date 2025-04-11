
import React, { useCallback, useState } from 'react';
import { Control, useController } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FileUp, File, X, AlertCircle } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DocumentUploadFormValues } from '../schemas/documentSchema';

interface FileUploadFieldProps {
  control: Control<DocumentUploadFormValues>;
  name: "files";
  maxFiles?: number;
  acceptedFileTypes?: Record<string, string[]>;
  maxSize?: number; // in bytes
  label?: string;
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({
  control,
  name,
  maxFiles = 1,
  acceptedFileTypes,
  maxSize = 10 * 1024 * 1024, // 10MB default
  label = "Upload Files"
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { field } = useController({
    name,
    control,
  });

  const handleFileChange = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    
    // Reset error
    setError(null);
    
    const files = Array.from(newFiles);
    
    // Validate file count
    if (files.length > maxFiles) {
      setError(`You can only upload a maximum of ${maxFiles} file${maxFiles > 1 ? 's' : ''}`);
      return;
    }
    
    // Validate file types if specified
    if (acceptedFileTypes) {
      const acceptedExtensions = Object.values(acceptedFileTypes).flat();
      const acceptedMimeTypes = Object.keys(acceptedFileTypes);
      
      const invalidFiles = files.filter(file => {
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        const fileMimeType = file.type;
        
        return (
          !acceptedExtensions.includes(fileExtension) &&
          !acceptedMimeTypes.some(mime => 
            fileMimeType.startsWith(mime.replace('/*', ''))
          )
        );
      });
      
      if (invalidFiles.length > 0) {
        setError(`Unsupported file type: ${invalidFiles[0].name}`);
        return;
      }
    }
    
    // Validate file size
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setError(`File too large: ${oversizedFiles[0].name} (max ${formatFileSize(maxSize)})`);
      return;
    }
    
    // Update the form field with the files
    field.onChange(files);
  }, [field, maxFiles, maxSize, acceptedFileTypes]);
  
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  }, [handleFileChange]);
  
  const removeFile = useCallback((indexToRemove: number) => {
    const currentFiles = field.value || [];
    const updatedFiles = currentFiles.filter((_, index) => index !== indexToRemove);
    field.onChange(updatedFiles);
  }, [field]);
  
  const getAcceptedFileTypesString = () => {
    if (!acceptedFileTypes) return '';
    
    return Object.values(acceptedFileTypes).flat().join(',');
  };
  
  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div
              className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors
                ${dragActive ? 'border-primary bg-blue-50' : 'border-input hover:border-[#0485ea]'}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById(`file-upload-${name}`)?.click()}
            >
              <input
                id={`file-upload-${name}`}
                type="file"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files)}
                accept={getAcceptedFileTypesString()}
                multiple={maxFiles > 1}
              />

              {field.value && field.value.length > 0 ? (
                <div className="space-y-2">
                  {field.value.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between p-2 border rounded-md bg-background"
                    >
                      <div className="flex items-center space-x-2">
                        <File className="h-5 w-5 text-[#0485ea]" />
                        <div className="flex flex-col">
                          <p className="text-sm font-medium truncate max-w-[180px] sm:max-w-sm">
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
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {field.value.length < maxFiles && (
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2 w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById(`file-upload-${name}`)?.click();
                      }}
                    >
                      <FileUp className="h-4 w-4 mr-2" />
                      Add Another File
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-3 rounded-full bg-blue-50">
                    <FileUp className="h-8 w-8 text-[#0485ea]" />
                  </div>
                  <div className="flex flex-col space-y-1 text-center">
                    <p className="text-sm font-medium">
                      Drag & drop files or <span className="text-[#0485ea]">browse</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {acceptedFileTypes ? (
                        <>
                          Accepted file types: {Object.values(acceptedFileTypes).flat().join(', ')}
                        </>
                      ) : (
                        'Upload files (max 10MB)'
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </FormControl>
          
          {error && (
            <div className="flex items-center mt-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {error}
            </div>
          )}
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FileUploadField;
