
import { EntityType, Document } from '../schemas/documentSchema';
import { WorkOrderDocument } from '@/components/workOrders/details/DocumentsList/types';

// Convert a string to EntityType enum
export function parseEntityType(entityTypeStr: string): EntityType {
  if (!entityTypeStr) return EntityType.PROJECT;
  
  // Try direct match first (case insensitive)
  const normalizedEntityType = entityTypeStr.toUpperCase();
  
  // Check if the normalized entity type is a valid EntityType value
  if (Object.values(EntityType).includes(normalizedEntityType as EntityType)) {
    return normalizedEntityType as EntityType;
  }
  
  // If no direct match, try to map common variations
  switch (normalizedEntityType) {
    case 'PROJECT':
      return EntityType.PROJECT;
    case 'ESTIMATE':
      return EntityType.ESTIMATE;
    case 'ESTIMATE_ITEM':
    case 'ESTIMATEITEM':
      return EntityType.ESTIMATE_ITEM;
    case 'WORK_ORDER':
    case 'WORKORDER':
      return EntityType.WORK_ORDER;
    case 'SUBCONTRACTOR':
      return EntityType.SUBCONTRACTOR;
    case 'VENDOR':
      return EntityType.VENDOR;
    case 'CUSTOMER':
      return EntityType.CUSTOMER;
    case 'CONTACT':
      return EntityType.CONTACT;
    case 'EMPLOYEE':
      return EntityType.EMPLOYEE;
    case 'SITE_LOCATION':
    case 'SITELOCATION':
      return EntityType.SITE_LOCATION;
    case 'CHANGE_ORDER':
    case 'CHANGEORDER':
      return EntityType.CHANGE_ORDER;
    case 'MATERIAL':
      return EntityType.MATERIAL;
    case 'EQUIPMENT':
      return EntityType.EQUIPMENT;
    case 'TIME_ENTRY':
    case 'TIMEENTRY':
      return EntityType.TIME_ENTRY;
    case 'RECEIPT':
      return EntityType.RECEIPT;
    default:
      console.warn(`Unknown entity type: ${entityTypeStr}. Defaulting to PROJECT.`);
      return EntityType.PROJECT;
  }
}

// Convert a document to WorkOrderDocument type
export function convertToWorkOrderDocument(doc: Document): WorkOrderDocument {
  return {
    document_id: doc.document_id,
    file_name: doc.file_name,
    file_type: doc.file_type || '',
    file_size: doc.file_size || 0,
    storage_path: doc.storage_path,
    url: doc.url || '',
    entity_id: doc.entity_id,
    entity_type: doc.entity_type.toString(),
    created_at: doc.created_at,
    updated_at: doc.updated_at || doc.created_at,
    category: doc.category || '',
    is_receipt: !!doc.is_expense,
    tags: doc.tags || [],
    uploaded_by: doc.uploaded_by || '',
    version: doc.version || 1,
    is_latest_version: !!doc.is_latest_version,
    parent_document_id: doc.parent_document_id
  };
}

// Convert a WorkOrderDocument to Document type
export function convertToDocument(doc: WorkOrderDocument): Document {
  return {
    document_id: doc.document_id,
    file_name: doc.file_name,
    file_type: doc.file_type,
    file_size: doc.file_size,
    storage_path: doc.storage_path,
    url: doc.url,
    entity_id: doc.entity_id,
    entity_type: parseEntityType(doc.entity_type),
    created_at: doc.created_at,
    updated_at: doc.updated_at,
    category: doc.category,
    is_expense: doc.is_receipt,
    tags: doc.tags,
    uploaded_by: doc.uploaded_by,
    version: doc.version,
    is_latest_version: doc.is_latest_version,
    parent_document_id: doc.parent_document_id
  };
}

// Fix document download functionality
export function createDocumentDownloadLink(document: Document): void {
  if (!document || !document.storage_path || !document.file_name) {
    console.error('Invalid document data for download');
    return;
  }
  
  // Get a direct download link for the document
  if (document.url) {
    // Create a temporary link element
    const a = document.createElement('a');
    a.href = document.url;
    a.download = document.file_name;
    
    // Append to the document body
    document.body.appendChild(a);
    
    // Trigger the download
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    return;
  }
  
  // If no direct URL is available, use the storage path to generate one
  console.warn('Document URL not available, attempting to use storage path');
}
