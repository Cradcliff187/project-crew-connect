import * as React from 'react';
import { cn } from '@/lib/utils';
import { useDeviceCapabilities } from '@/hooks/use-mobile';
import { Dropzone } from './file-upload/dropzone';
import { SelectedFiles } from './file-upload/selected-files';
import { CameraButton } from './file-upload/camera-button';
import { validateFiles } from './file-upload/file-validation';

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
  (
    {
      onFilesSelected,
      onFileClear,
      selectedFiles = [],
      allowCamera = true,
      allowMultiple = false,
      acceptedFileTypes = 'image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain',
      maxFileSize = 10, // 10MB default
      className,
      dropzoneText = 'Drag files here or click to upload',
      ...props
    },
    ref
  ) => {
    const { isMobile, hasCamera } = useDeviceCapabilities();
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [errors, setErrors] = React.useState<string[]>([]);

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const fileArray = Array.from(e.target.files);
        console.log(
          'Files selected via input:',
          fileArray.map(f => ({ name: f.name, type: f.type, size: f.size }))
        );
        validateAndProcessFiles(fileArray);
      }
    };

    const validateAndProcessFiles = (files: File[]) => {
      const validation = validateFiles(files, { maxFileSize, acceptedFileTypes });

      setErrors(validation.errors);

      if (validation.validFiles.length > 0) {
        console.log(
          'Valid files being passed to onFilesSelected:',
          validation.validFiles.map(f => f.name)
        );
        onFilesSelected(validation.validFiles);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    const handleCameraCapture = () => {
      if (fileInputRef.current) {
        fileInputRef.current.capture = 'environment';
        fileInputRef.current.accept = 'image/*';
        fileInputRef.current.click();
      }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const fileArray = Array.from(e.dataTransfer.files);
        console.log(
          'Files dropped:',
          fileArray.map(f => ({ name: f.name, type: f.type, size: f.size }))
        );
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
        fileInputRef.current.capture = '';
        fileInputRef.current.accept = acceptedFileTypes;
        fileInputRef.current.click();
      }
    };

    return (
      <div className={cn('space-y-4', className)}>
        <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
          <Dropzone
            isDragging={isDragging}
            dropzoneText={dropzoneText}
            acceptedFileTypes={acceptedFileTypes}
            maxFileSize={maxFileSize}
            onClick={handleClickUpload}
          />
        </div>

        {errors.length > 0 && (
          <div className="text-destructive text-sm">
            {errors.map((error, i) => (
              <p key={i}>{error}</p>
            ))}
          </div>
        )}

        {allowCamera && isMobile && hasCamera && (
          <CameraButton onCameraCapture={handleCameraCapture} />
        )}

        <input
          type="file"
          ref={e => {
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

        <SelectedFiles files={selectedFiles} onRemoveFile={removeFile} />
      </div>
    );
  }
);

FileUpload.displayName = 'FileUpload';
