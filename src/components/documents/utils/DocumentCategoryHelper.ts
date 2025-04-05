
import { DocumentCategory, EntityType } from "../schemas/documentSchema";

/**
 * Map of document categories by entity type with display names
 */
export const documentCategoryMap: {
  [key in EntityType]?: { 
    value: DocumentCategory; 
    label: string;
    description?: string;
  }[]
} = {
  PROJECT: [
    { value: 'contract', label: 'Contract' },
    { value: 'invoice', label: 'Invoice' },
    { value: 'receipt', label: 'Receipt' },
    { value: 'estimate', label: 'Estimate' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'warranty', label: 'Warranty' },
    { value: 'permit', label: 'Permit' },
    { value: '3rd_party_estimate', label: '3rd Party Estimate' },
    { value: 'photo', label: 'Photo' },
    { value: 'sketch', label: 'Sketch/Drawing' },
    { value: 'other', label: 'Other' },
  ],
  WORK_ORDER: [
    { value: 'receipt', label: 'Receipt' },
    { value: 'invoice', label: 'Invoice' },
    { value: 'photo', label: 'Photo' },
    { value: 'estimate', label: 'Estimate' },
    { value: 'other', label: 'Other' },
  ],
  ESTIMATE: [
    { value: 'contract', label: 'Contract' },
    { value: '3rd_party_estimate', label: '3rd Party Estimate' },
    { value: 'photo', label: 'Photo' },
    { value: 'sketch', label: 'Sketch/Drawing' },
    { value: 'other', label: 'Other' },
  ],
  CUSTOMER: [
    { value: 'contract', label: 'Contract' },
    { value: 'invoice', label: 'Invoice' },
    { value: 'communication', label: 'Communication' },
    { value: 'photo', label: 'Photo' },
    { value: 'other', label: 'Other' },
  ],
  VENDOR: [
    { value: 'contract', label: 'Contract' },
    { value: 'invoice', label: 'Invoice' },
    { value: 'certification', label: 'Certification' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'communication', label: 'Communication' },
    { value: 'other', label: 'Other' },
  ],
  SUBCONTRACTOR: [
    { value: 'contract', label: 'Contract' },
    { value: 'invoice', label: 'Invoice' },
    { value: 'certification', label: 'Certification' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'communication', label: 'Communication' },
    { value: 'other', label: 'Other' },
  ],
  EXPENSE: [
    { value: 'receipt', label: 'Receipt' },
    { value: 'invoice', label: 'Invoice' },
    { value: 'other', label: 'Other' },
  ],
  TIME_ENTRY: [
    { value: 'receipt', label: 'Receipt' },
    { value: 'photo', label: 'Photo' },
    { value: 'other', label: 'Other' },
  ],
  EMPLOYEE: [
    { value: 'certification', label: 'Certification' },
    { value: 'contract', label: 'Contract/Agreement' },
    { value: 'identification', label: 'Identification' },
    { value: 'other', label: 'Other' },
  ],
  ESTIMATE_ITEM: [
    { value: 'photo', label: 'Photo' },
    { value: 'other', label: 'Other' },
  ],
};

/**
 * Get categories for a specific entity type
 */
export const getCategoriesForEntityType = (entityType: EntityType): { value: DocumentCategory; label: string }[] => {
  return documentCategoryMap[entityType] || documentCategoryMap.PROJECT || [];
};

/**
 * Get default category for a specific entity type
 */
export const getDefaultCategoryForEntityType = (entityType: EntityType): DocumentCategory => {
  const categories = getCategoriesForEntityType(entityType);
  return categories.length > 0 ? categories[0].value : 'other';
};

/**
 * Format the entity type for display
 */
export const formatEntityTypeForDisplay = (entityType: EntityType | string): string => {
  if (!entityType) return '';
  
  // Handle special cases
  switch (entityType) {
    case 'WORK_ORDER':
      return 'Work Order';
    case 'TIME_ENTRY':
      return 'Time Entry';
    case 'ESTIMATE_ITEM':
      return 'Estimate Item';
    default:
      // Convert SNAKE_CASE to Title Case
      return entityType
        .toString()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
  }
};

/**
 * Check if entity type requires a vendor selection
 */
export const entityNeedsVendor = (entityType: EntityType): boolean => {
  return ['EXPENSE', 'WORK_ORDER'].includes(entityType);
};

/**
 * Check if entity type can support expense documents
 */
export const entitySupportsExpenses = (entityType: EntityType): boolean => {
  return ['PROJECT', 'WORK_ORDER', 'EXPENSE'].includes(entityType);
};
