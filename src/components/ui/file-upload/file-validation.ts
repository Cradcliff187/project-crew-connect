
export interface FileValidationOptions {
  maxFileSize?: number; // in MB
  acceptedFileTypes?: string;
}

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  validFiles: File[];
}

// Map file extensions to MIME types
const extensionToMimeType: Record<string, string[]> = {
  '.doc': ['application/msword'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  '.xls': ['application/vnd.ms-excel'],
  '.xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  '.txt': ['text/plain'],
  '.pdf': ['application/pdf'],
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
  '.gif': ['image/gif']
};

export const validateFiles = (
  files: File[],
  options: FileValidationOptions
): FileValidationResult => {
  const { maxFileSize = 10, acceptedFileTypes = "image/*,application/pdf" } = options;
  const errors: string[] = [];
  
  // Parse the accepted types
  const acceptedTypesArray = acceptedFileTypes.split(',');
  
  // Add proper MIME types for any file extensions included in acceptedTypesArray
  const extendedAcceptedTypes = [...acceptedTypesArray];
  
  acceptedTypesArray.forEach(type => {
    if (type.startsWith('.') && extensionToMimeType[type]) {
      extensionToMimeType[type].forEach(mimeType => {
        if (!extendedAcceptedTypes.includes(mimeType)) {
          extendedAcceptedTypes.push(mimeType);
        }
      });
    }
  });
  
  const validFiles = files.filter(file => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      errors.push(`${file.name} exceeds maximum size of ${maxFileSize}MB`);
      return false;
    }
    
    // Check file type
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    const fileExtension = '.' + fileName.split('.').pop();
    
    // Check if the file type matches any accepted MIME type
    const isValidType = extendedAcceptedTypes.some(type => {
      // Handle wildcard MIME types like image/*
      if (type.includes('*')) {
        const category = type.split('/')[0];
        return fileType.startsWith(category);
      }
      
      // Handle extension-based types like .doc
      if (type.startsWith('.')) {
        return fileExtension === type;
      }
      
      // Direct MIME type comparison
      return type === fileType;
    });
    
    // If file type is empty but extension is recognized, use extension-based validation
    if (!fileType && fileExtension) {
      const mimeTypes = extensionToMimeType[fileExtension];
      if (mimeTypes && mimeTypes.some(mimeType => extendedAcceptedTypes.includes(mimeType))) {
        return true;
      }
    }
    
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
