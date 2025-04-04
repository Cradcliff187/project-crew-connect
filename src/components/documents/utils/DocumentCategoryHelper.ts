
import { EntityType, DocumentCategory } from '../schemas/documentSchema';

/**
 * Maps entity types to their appropriate default document categories
 */
export const getDefaultCategoryForEntity = (entityType: EntityType): DocumentCategory => {
  switch (entityType) {
    case 'PROJECT':
      return 'photo';
    case 'WORK_ORDER':
      return 'receipt';
    case 'VENDOR':
    case 'SUBCONTRACTOR':
      return 'certification';
    case 'CUSTOMER':
      return 'contract';
    case 'ESTIMATE':
      return 'contract';
    default:
      return 'other';
  }
};

/**
 * Gets appropriate document categories for a given entity type
 */
export const getEntityCategories = (entityType: EntityType): DocumentCategory[] => {
  // Base categories available for all entity types
  const baseCategories: DocumentCategory[] = ['receipt', 'invoice', 'other'];
  
  // Entity-specific categories
  switch (entityType) {
    case 'PROJECT':
      return [...baseCategories, 'photo', 'contract', '3rd_party_estimate'];
      
    case 'WORK_ORDER':
      return [...baseCategories, 'photo'];
      
    case 'VENDOR':
    case 'SUBCONTRACTOR':
      return [...baseCategories, 'certification', 'insurance', 'contract'];
      
    case 'CUSTOMER':
      return [...baseCategories, 'contract', '3rd_party_estimate'];
      
    case 'ESTIMATE':
      return [...baseCategories, 'contract', '3rd_party_estimate'];
      
    case 'EMPLOYEE':
      return [...baseCategories, 'certification'];
      
    default:
      return baseCategories;
  }
};

/**
 * Validates if a string is a valid DocumentCategory
 */
export const isValidDocumentCategory = (category: string): category is DocumentCategory => {
  const validCategories: DocumentCategory[] = [
    'invoice', 
    'receipt', 
    '3rd_party_estimate', 
    'contract', 
    'insurance', 
    'certification', 
    'photo', 
    'other'
  ];
  
  return validCategories.includes(category as DocumentCategory);
};

/**
 * Safely converts a string to a DocumentCategory with fallback to 'other'
 */
export const toDocumentCategory = (category: string): DocumentCategory => {
  if (isValidDocumentCategory(category)) {
    return category;
  }
  return 'other';
};
