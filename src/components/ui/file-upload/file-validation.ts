/**
 * File validation utilities for the file upload component
 */

interface FileValidationResult {
  validFiles: File[];
  errors: string[];
}

interface ValidationOptions {
  maxFileSize?: number; // in MB
  acceptedFileTypes?: string;
}

export const validateFiles = (
  files: File[],
  options: ValidationOptions = {}
): FileValidationResult => {
  const { maxFileSize = 10, acceptedFileTypes = '' } = options;

  const maxSizeInBytes = maxFileSize * 1024 * 1024;
  const acceptedTypes = acceptedFileTypes
    .split(',')
    .map(type => type.trim())
    .filter(Boolean);

  const validFiles: File[] = [];
  const errors: string[] = [];

  for (const file of files) {
    // Check file size
    if (file.size > maxSizeInBytes) {
      errors.push(`File "${file.name}" exceeds the maximum size of ${maxFileSize}MB.`);
      continue;
    }

    // Check file type if needed
    if (acceptedTypes.length > 0) {
      // Handle mime type patterns like image/* or specific types
      const isValidType = acceptedTypes.some(type => {
        if (type.includes('*')) {
          // For wildcard types like 'image/*'
          const mainType = type.split('/')[0];
          return file.type.startsWith(`${mainType}/`);
        } else {
          // For specific types
          return file.type === type || type.includes(file.name.split('.').pop() || '');
        }
      });

      if (!isValidType) {
        errors.push(`File "${file.name}" has an unsupported format.`);
        continue;
      }
    }

    validFiles.push(file);
  }

  return { validFiles, errors };
};
