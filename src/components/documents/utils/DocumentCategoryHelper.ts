import { DocumentCategory, entityCategoryMap } from '../schemas/documentSchema';

export const isValidDocumentCategory = (value: string): value is DocumentCategory => {
  const validCategories = [
    'invoice',
    'receipt',
    '3rd_party_estimate',
    'contract',
    'insurance',
    'certification',
    'photo',
    'other',
  ];
  return validCategories.includes(value as DocumentCategory);
};

export const toDocumentCategory = (value: string): DocumentCategory => {
  if (isValidDocumentCategory(value)) {
    return value;
  }
  return 'other'; // Default fallback
};

export const getEntityCategories = (entityType: string): DocumentCategory[] => {
  if (entityType in entityCategoryMap) {
    // Filter and ensure we only include valid DocumentCategory types
    return entityCategoryMap[entityType].filter(isValidDocumentCategory).map(toDocumentCategory);
  }
  return [
    'invoice',
    'receipt',
    '3rd_party_estimate',
    'contract',
    'insurance',
    'certification',
    'photo',
    'other',
  ];
};

export const getCategoryDisplayName = (category: DocumentCategory): string => {
  const displayNames: Record<DocumentCategory, string> = {
    invoice: 'Invoice',
    receipt: 'Receipt',
    '3rd_party_estimate': 'Third-Party Estimate',
    contract: 'Contract',
    insurance: 'Insurance',
    certification: 'Certification',
    photo: 'Photo',
    other: 'Other',
  };

  return (
    displayNames[category] || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  );
};

export const documentCategoryMap = {
  PROJECT: ['contract', 'photo', 'certification', 'receipt', 'invoice', 'other'],
  CUSTOMER: ['contract', 'invoice', 'other'],
  ESTIMATE: ['3rd_party_estimate', 'contract', 'other'],
  WORK_ORDER: ['receipt', 'photo', 'invoice', 'other'],
  VENDOR: ['invoice', 'certification', 'contract', 'receipt', 'other'],
  SUBCONTRACTOR: ['certification', 'insurance', 'contract', 'invoice', 'other'],
  CONTACT: ['contract', 'certification', 'other'],
  EXPENSE: ['receipt', 'invoice', 'other'],
  TIME_ENTRY: ['receipt', 'photo', 'other'],
  ESTIMATE_ITEM: ['receipt', 'invoice', '3rd_party_estimate', 'other'],
};
