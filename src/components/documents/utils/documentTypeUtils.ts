
import { EntityType, Document } from '../schemas/documentSchema';
import { WorkOrderDocument } from '@/components/workOrders/details/DocumentsList/types';

// Convert a string to EntityType enum
export function parseEntityType(entityTypeStr: string): EntityType {
  // Match the string to an EntityType enum value
  const matchedEntityType = Object.values(EntityType).find(
    (type) => type === entityTypeStr.toUpperCase()
  );
  
  if (matchedEntityType) {
    return matchedEntityType;
  }
  
  console.warn(`Invalid entity type: ${entityTypeStr}. Defaulting to PROJECT.`);
  return EntityType.PROJECT;
}

// Convert a document to WorkOrderDocument type
export function convertToWorkOrderDocument(doc: Document): WorkOrderDocument {
  return {
    document_id: doc.document_id,
    file_name: doc.file_name,
    file_type: doc.file_type || '',
    file_size: doc.file_size,
    storage_path: doc.storage_path,
    url: doc.url || '',
    entity_id: doc.entity_id,
    entity_type: doc.entity_type.toString(),
    created_at: doc.created_at,
    updated_at: doc.updated_at || doc.created_at,
    category: doc.category,
    is_receipt: doc.is_expense,
    tags: doc.tags || [],
    uploaded_by: doc.uploaded_by,
    version: doc.version,
    is_latest_version: doc.is_latest_version,
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
