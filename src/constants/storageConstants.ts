
/**
 * Storage constants for document management
 */

// The ID of the bucket where documents are stored
export const DOCUMENTS_BUCKET_ID = 'construction_documents';

// Document entity types
export const DOCUMENT_ENTITY_TYPES = {
  PROJECT: 'PROJECT',
  ESTIMATE: 'ESTIMATE',
  ESTIMATE_ITEM: 'ESTIMATE_ITEM',
  VENDOR: 'VENDOR',
  WORK_ORDER: 'WORK_ORDER',
  TIME_ENTRY: 'TIME_ENTRY'
} as const;

// Path prefixes for storage organization
export const STORAGE_PATHS = {
  ESTIMATES: 'estimates',
  PROJECTS: 'projects',
  RECEIPTS: 'receipts'
};
