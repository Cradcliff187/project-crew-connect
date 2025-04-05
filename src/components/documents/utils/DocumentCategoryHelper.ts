
import { DocumentCategory, EntityType, entityCategoryMap } from '../schemas/documentSchema';

/**
 * Helper function to convert a string to a valid DocumentCategory type
 * @param category The string to convert
 * @returns The string as a DocumentCategory if valid, otherwise 'other'
 */
export const toDocumentCategory = (category: string): DocumentCategory => {
  // Check if the category is a valid DocumentCategory
  if (isValidDocumentCategory(category)) {
    return category;
  }
  
  // Return 'other' as a fallback
  return 'other';
};

/**
 * Type guard to check if a string is a valid DocumentCategory
 * @param category The string to check
 * @returns True if the string is a valid DocumentCategory, false otherwise
 */
export const isValidDocumentCategory = (
  category: string
): category is DocumentCategory => {
  return [
    'invoice',
    'receipt',
    '3rd_party_estimate',
    'contract',
    'insurance',
    'certification',
    'photo',
    'other'
  ].includes(category as DocumentCategory);
};

/**
 * Helper function to get available document categories for a specific entity type
 * @param entityType The entity type to get categories for
 * @returns Array of DocumentCategory objects
 */
export const getEntityCategories = (entityType: EntityType): DocumentCategory[] => {
  if (entityType in entityCategoryMap) {
    // Filter out any categories that aren't valid
    return (entityCategoryMap[entityType] || [])
      .filter(isValidDocumentCategory) as DocumentCategory[];
  }
  
  // Return default categories if entity type is not in map
  return ['receipt', 'invoice', 'photo', 'other'] as DocumentCategory[];
};

/**
 * Helper function to get suggested categories based on entity type and file type
 * @param entityType The entity type
 * @param fileType The MIME type of the file
 * @returns The recommended document category
 */
export const suggestCategory = (
  entityType: EntityType,
  fileType: string
): DocumentCategory => {
  // Image files are typically photos
  if (fileType.startsWith('image/')) {
    return 'photo';
  }
  
  // PDF files could be any type of document, suggest based on entity
  if (fileType === 'application/pdf') {
    switch (entityType) {
      case 'VENDOR':
        return 'certification';
      case 'SUBCONTRACTOR':
        return 'insurance';
      case 'ESTIMATE':
        return '3rd_party_estimate';
      case 'PROJECT':
      case 'WORK_ORDER':
        return 'contract';
      default:
        return 'other';
    }
  }
  
  // Default to 'other'
  return 'other';
};

/**
 * Helper function to get display name for a document category
 * @param category The document category
 * @returns User-friendly display name
 */
export const getCategoryDisplayName = (category: DocumentCategory): string => {
  switch (category) {
    case '3rd_party_estimate':
      return 'Estimate';
    case 'receipt':
      return 'Receipt';
    case 'invoice':
      return 'Invoice';
    case 'contract':
      return 'Contract';
    case 'insurance':
      return 'Insurance';
    case 'certification':
      return 'Certification';
    case 'photo':
      return 'Photo';
    case 'other':
      return 'Other';
    default:
      // Fixed the type error by checking if category is a string before using charAt/slice
      return typeof category === 'string' 
        ? category.charAt(0).toUpperCase() + category.slice(1)
        : String(category);
  }
};
