
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
  acceptedFileTypes = "image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
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

  // Create a proper accept object for react-dropzone
  const getAcceptObject = () => {
    const acceptMap: Record<string, string[]> = {};
    
    acceptedFileTypes.split(',').forEach(type => {
      // Handle mapping from extension to MIME type
      if (type.startsWith('.')) {
        switch (type) {
          case '.doc':
            acceptMap['application/msword'] = [];
            break;
          case '.docx':
            acceptMap['application/vnd.openxmlformats-officedocument.wordprocessingml.document'] = [];
            break;
          case '.xls':
            acceptMap['application/vnd.ms-excel'] = [];
            break;
          case '.xlsx':
            acceptMap['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] = [];
            break;
          case '.txt':
            acceptMap['text/plain'] = [];
            break;
          default:
            // For other extensions, store them as they are
            acceptMap[type] = [];
        }
      } else {
        // For MIME types, store them directly
        acceptMap[type] = [];
      }
    });
    
    return acceptMap;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAcceptObject(),
    maxSize: maxFileSize * 1024 * 1024,
    multiple: true
  });

  const handleRemoveFile = (index: number) => {
    const newFiles = [...watchFiles];
    newFiles.splice(index, 1);
    onFileSelect(newFiles);
  };

  const getFileTypeDisplay = () => {
    // Convert technical MIME types to human-readable format
    return acceptedFileTypes
      .replace(/image\/\*/g, 'Images')
      .replace(/application\/pdf/g, 'PDF')
      .replace(/application\/msword/g, 'Word (.doc)')
      .replace(/application\/vnd.openxmlformats-officedocument.wordprocessingml.document/g, 'Word (.docx)')
      .replace(/application\/vnd.ms-excel/g, 'Excel (.xls)')
      .replace(/application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet/g, 'Excel (.xlsx)')
      .replace(/text\/plain/g, 'Text (.txt)');
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
                acceptedFileTypes={getFileTypeDisplay()}
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
