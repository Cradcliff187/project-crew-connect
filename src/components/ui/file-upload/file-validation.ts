
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
  const { maxFileSize = 10, acceptedFileTypes = "image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain" } = options;
  const errors: string[] = [];
  
  // Log validation attempt for debugging
  console.log('Validating files:', files.map(f => ({name: f.name, type: f.type, size: f.size})));
  console.log('Validation options:', options);
  
  const validFiles = files.filter(file => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      errors.push(`${file.name} exceeds maximum size of ${maxFileSize}MB`);
      return false;
    }
    
    // Detect file type from extension if MIME type is generic or missing
    let fileType = file.type.toLowerCase();
    if (!fileType || fileType === 'application/octet-stream') {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension) {
        // Map common extensions to MIME types
        const mimeMap: Record<string, string> = {
          'pdf': 'application/pdf',
          'doc': 'application/msword',
          'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'xls': 'application/vnd.ms-excel',
          'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'png': 'image/png',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'gif': 'image/gif',
          'txt': 'text/plain'
        };
        
        if (mimeMap[extension]) {
          fileType = mimeMap[extension];
          console.log(`Using extension-based type for ${file.name}: ${fileType}`);
        }
      }
    }
    
    // Check file type against accepted types
    const acceptedTypes = acceptedFileTypes.split(',');
    const isValidType = acceptedTypes.some(type => {
      type = type.trim();
      
      if (type.includes('*')) {
        // Handle wildcards (e.g., "image/*")
        const typePrefix = type.split('/')[0];
        return fileType.startsWith(typePrefix);
      }
      
      // Direct comparison
      return type === fileType;
    });
    
    if (!isValidType) {
      console.log(`${file.name} (${fileType}) is not an accepted file type`);
      errors.push(`${file.name} is not an accepted file type`);
      return false;
    }
    
    return true;
  });
  
  console.log('Validation result:', {
    valid: errors.length === 0,
    errors,
    validFiles: validFiles.map(f => f.name)
  });
  
  return {
    valid: errors.length === 0,
    errors,
    validFiles
  };
};
