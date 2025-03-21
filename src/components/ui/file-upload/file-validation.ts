
export interface FileValidationOptions {
  maxFileSize?: number; // in MB
  acceptedFileTypes?: string;
}

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  validFiles: File[];
}

export const validateFiles = (
  files: File[],
  options: FileValidationOptions
): FileValidationResult => {
  const { maxFileSize = 10, acceptedFileTypes = "image/*,application/pdf" } = options;
  const errors: string[] = [];
  
  const validFiles = files.filter(file => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      errors.push(`${file.name} exceeds maximum size of ${maxFileSize}MB`);
      return false;
    }
    
    // Check file type
    const fileType = file.type.toLowerCase();
    const acceptedTypes = acceptedFileTypes.split(',');
    const isValidType = acceptedTypes.some(type => {
      if (type.includes('*')) {
        return fileType.startsWith(type.split('/')[0]);
      }
      return type === fileType;
    });
    
    if (!isValidType) {
      errors.push(`${file.name} is not an accepted file type`);
      return false;
    }
    
    return true;
  });
  
  return {
    valid: errors.length === 0,
    errors,
    validFiles
  };
};
