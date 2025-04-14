import React, { useCallback, memo } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FolderOpen, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { DocumentUploadFormValues } from '../schemas/documentSchema';

interface DropzoneUploaderProps {
  control: Control<DocumentUploadFormValues>;
  onFileSelect: (files: File[]) => void;
  previewURL: string | null;
  watchFiles: File[];
  label?: string;
}

const DropzoneUploader: React.FC<DropzoneUploaderProps> = ({
  control,
  onFileSelect,
  previewURL,
  watchFiles,
  label = 'Upload Document',
}) => {
  // Set up react-dropzone
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    multiple: false,
    maxSize: 10485760, // 10MB max
  });

  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <FormField
      control={control}
      name="files"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="flex flex-col items-center justify-center w-full">
              <div
                {...getRootProps()}
                className={cn(
                  'flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-lg cursor-pointer',
                  isDragActive ? 'bg-gray-100 border-[#0485ea]' : 'bg-gray-50 hover:bg-gray-100',
                  watchFiles.length > 0 ? 'border-[#0485ea]' : 'border-gray-300'
                )}
              >
                <input
                  {...getInputProps()}
                  onChange={e => {
                    if (e.target.files && e.target.files.length > 0) {
                      const fileArray = Array.from(e.target.files) as File[];
                      field.onChange(fileArray);
                      onFileSelect(fileArray);
                    }
                  }}
                />

                {previewURL ? (
                  <div className="w-full h-full p-2 flex flex-col items-center justify-center">
                    <img
                      src={previewURL}
                      alt="Preview"
                      className="max-h-36 max-w-full object-contain mb-2"
                    />
                    <p className="text-sm text-[#0485ea] font-medium">{watchFiles[0]?.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(watchFiles[0]?.size || 0)}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {isDragActive ? (
                      <>
                        <Upload className="w-10 h-10 mb-3 text-[#0485ea]" />
                        <p className="mb-2 text-sm font-semibold text-[#0485ea]">
                          Drop your file here
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 mb-3 text-[#0485ea]" />
                        <p className="mb-2 text-sm">
                          <span className="font-semibold text-[#0485ea]">Drag and drop</span> your
                          file here
                        </p>
                        <p className="text-xs text-gray-500 mb-2">
                          PDF, Word, Excel, Images and text files accepted
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2 border-[#0485ea] text-[#0485ea]"
                        >
                          <FolderOpen className="h-4 w-4 mr-2" />
                          Browse Files
                        </Button>
                      </>
                    )}

                    {watchFiles.length > 0 && !previewURL && (
                      <div className="mt-4 flex items-center">
                        <File className="h-5 w-5 mr-2 text-[#0485ea]" />
                        <div>
                          <p className="text-sm text-[#0485ea] font-medium">{watchFiles[0].name}</p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(watchFiles[0].size)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

// Use React.memo to prevent unnecessary re-renders
export default memo(DropzoneUploader);
