
import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Control, Controller } from 'react-hook-form';
import { validateFiles } from '@/components/ui/file-upload/file-validation';
import { Dropzone } from '@/components/ui/file-upload/dropzone';
import { SelectedFiles } from '@/components/ui/file-upload/selected-files';
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DocumentUploadFormValues } from '../schemas/documentSchema';

interface DropzoneUploaderProps {
  control: Control<DocumentUploadFormValues>;
  previewURL: string | null;
  onFileSelect: (files: File[]) => void;
  watchFiles: File[];
  label?: string;
  maxFileSize?: number;
  acceptedFileTypes?: string;
}

const DropzoneUploader: React.FC<DropzoneUploaderProps> = ({
  control,
  previewURL,
  onFileSelect,
  watchFiles,
  label = "Upload Files",
  maxFileSize = 10,
  acceptedFileTypes = "image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
}) => {
  const [error, setError] = useState<string | null>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validationResult = validateFiles(acceptedFiles, {
      maxFileSize,
      acceptedFileTypes
    });

    if (!validationResult.valid) {
      setError(validationResult.errors[0]);
      return;
    }

    setError(null);
    onFileSelect([...watchFiles, ...validationResult.validFiles]);
  }, [maxFileSize, acceptedFileTypes, onFileSelect, watchFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.split(',').reduce((acc, type) => {
      // Convert to object format required by react-dropzone
      if (type.includes('*')) {
        // Handle wildcard MIME types like image/* -> { 'image/*': [] }
        acc[type] = [];
      } else if (type.startsWith('.')) {
        // Handle file extensions like .pdf -> { '.pdf': [] }
        acc[type] = [];
      } else {
        // Handle specific MIME types like application/pdf -> { 'application/pdf': [] }
        acc[type] = [];
      }
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: maxFileSize * 1024 * 1024,
    multiple: true
  });

  const handleRemoveFile = (index: number) => {
    const newFiles = [...watchFiles];
    newFiles.splice(index, 1);
    onFileSelect(newFiles);
  };

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <Controller
        control={control}
        name="files"
        render={({ field: { onChange, value }, fieldState }) => (
          <div className="space-y-2">
            <div
              {...getRootProps()}
              ref={dropzoneRef}
              onClick={() => dropzoneRef.current?.click()}
            >
              <input {...getInputProps()} onChange={(e) => {
                const files = Array.from(e.target.files || []);
                onDrop(files);
              }} />
              <Dropzone
                isDragging={isDragActive}
                dropzoneText={isDragActive ? "Drop the files here" : "Drag & drop files here, or click to select"}
                acceptedFileTypes={acceptedFileTypes.replace(/\*/g, 'all ')}
                maxFileSize={maxFileSize}
                onClick={() => {}}
              />
            </div>

            {/* Preview Image (if applicable) */}
            {previewURL && (
              <div className="mt-4">
                <img
                  src={previewURL}
                  alt="Preview"
                  className="max-h-60 rounded-md mx-auto object-contain"
                />
              </div>
            )}

            {/* List of selected files */}
            <SelectedFiles
              files={watchFiles}
              onRemoveFile={handleRemoveFile}
            />

            {/* Error message */}
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            {fieldState.error && (
              <FormMessage>{fieldState.error.message}</FormMessage>
            )}
          </div>
        )}
      />
    </FormItem>
  );
};

export default DropzoneUploader;
