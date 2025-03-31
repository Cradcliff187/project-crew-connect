
interface ValidationOptions {
  maxFileSize: number; // in MB
  acceptedFileTypes: string;
}

interface ValidationResult {
  validFiles: File[];
  errors: string[];
}

export const validateFiles = (files: File[], options: ValidationOptions): ValidationResult => {
  const { maxFileSize, acceptedFileTypes } = options;
  const maxSizeInBytes = maxFileSize * 1024 * 1024; // Convert MB to bytes
  const validFiles: File[] = [];
  const errors: string[] = [];
  
  // Parse accepted types into an array of mime types or extensions
  const acceptedTypesArray = acceptedFileTypes
    .split(',')
    .map(type => type.trim().toLowerCase())
    .filter(Boolean);
  
  // Helper to check if a file type is accepted
  const isAcceptedType = (file: File): boolean => {
    // If we accept all files
    if (acceptedTypesArray.includes('*/*') || acceptedTypesArray.includes('*')) {
      return true;
    }
    
    // Check by mime type
    if (acceptedTypesArray.some(type => {
      // Handle wildcard mime types like 'image/*'
      if (type.endsWith('/*')) {
        const category = type.split('/')[0];
        return file.type.startsWith(`${category}/`);
      }
      return file.type === type;
    })) {
      return true;
    }
    
    // Check by extension
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    return acceptedTypesArray.some(type => type === extension);
  };
  
  Array.from(files).forEach(file => {
    let isValid = true;
    
    // Check file size
    if (file.size > maxSizeInBytes) {
      errors.push(`"${file.name}" exceeds the maximum file size of ${maxFileSize}MB.`);
      isValid = false;
    }
    
    // Check file type
    if (!isAcceptedType(file)) {
      errors.push(`"${file.name}" is not an accepted file type.`);
      isValid = false;
    }
    
    if (isValid) {
      validFiles.push(file);
    }
  });
  
  return { validFiles, errors };
};
