import { Document } from '../schemas/documentSchema';
import { WorkOrderDocument } from '../../workOrders/details/DocumentsList/types';

/**
 * Convert Document type to WorkOrderDocument type
 */
export const convertToWorkOrderDocument = (doc: Document): WorkOrderDocument => {
  return {
    document_id: doc.document_id || '',
    file_name: doc.file_name || '',
    file_type: doc.file_type || '',
    file_size: doc.file_size || 0,
    storage_path: doc.storage_path || '',
    url: doc.url || '',
    entity_id: doc.entity_id || '',
    entity_type: doc.entity_type || '',
    created_at: doc.created_at || '',
    updated_at: doc.updated_at || '',
    category: doc.category,
    is_receipt: doc.is_expense,
    tags: doc.tags,
    uploaded_by: doc.uploaded_by,
    version: doc.version,
    is_latest_version: doc.is_latest_version,
    parent_document_id: doc.parent_document_id,
  };
};

/**
 * Convert WorkOrderDocument type to Document type
 */
export const convertToDocument = (doc: WorkOrderDocument): Document => {
  return {
    document_id: doc.document_id,
    file_name: doc.file_name,
    file_type: doc.file_type,
    file_size: doc.file_size,
    storage_path: doc.storage_path,
    url: doc.url,
    entity_id: doc.entity_id,
    entity_type: doc.entity_type,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
    category: doc.category,
    is_expense: doc.is_receipt,
    tags: doc.tags,
    uploaded_by: doc.uploaded_by,
    version: doc.version,
    is_latest_version: doc.is_latest_version,
    parent_document_id: doc.parent_document_id,
    mime_type: doc.file_type || 'application/octet-stream',
  };
};
