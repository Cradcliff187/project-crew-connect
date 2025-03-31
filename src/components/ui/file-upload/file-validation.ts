
interface ValidationOptions {
  maxFileSize?: number; // in MB
  acceptedFileTypes?: string;
}

interface ValidationResult {
  validFiles: File[];
  errors: string[];
}

export const validateFiles = (files: File[], options: ValidationOptions): ValidationResult => {
  const { maxFileSize = 10, acceptedFileTypes = "" } = options;
  const validFiles: File[] = [];
  const errors: string[] = [];
  
  // Convert acceptedFileTypes string to array of extensions and MIME types
  const acceptedTypes = acceptedFileTypes
    .split(',')
    .map(type => type.trim())
    .filter(Boolean);
    
  // Helper to check if a file type is accepted
  const isTypeAccepted = (file: File): boolean => {
    if (!acceptedFileTypes || acceptedTypes.length === 0) {
      return true; // Accept all types if none specified
    }
    
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    
    return acceptedTypes.some(type => {
      // Check for MIME type match (e.g., "image/*", "application/pdf")
      if (type.includes('*')) {
        const typePrefix = type.split('*')[0];
        return file.type.startsWith(typePrefix);
      }
      
      // Check for extension match
      if (type.startsWith('.')) {
        return fileExtension === type.toLowerCase();
      }
      
      // Check for exact MIME type match
      return file.type === type;
    });
  };
  
  for (const file of files) {
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      errors.push(`"${file.name}" exceeds the maximum file size of ${maxFileSize}MB.`);
      continue;
    }
    
    // Check file type
    if (!isTypeAccepted(file)) {
      errors.push(`"${file.name}" is not an accepted file type.`);
      continue;
    }
    
    // File passed all validations
    validFiles.push(file);
  }
  
  return { validFiles, errors };
};
