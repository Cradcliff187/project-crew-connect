
import { supabase } from '@/integrations/supabase/client';
import { Document } from '../schemas/documentSchema';

// Helper function to get the URL for a document
export const getDocumentUrl = async (document: Document): Promise<string> => {
  if (!document?.storage_path) {
    console.error('Document has no storage path');
    return '';
  }

  try {
    const response = await supabase
      .storage
      .from('construction_documents')
      .getPublicUrl(document.storage_path);
    
    return response.data.publicUrl;
  } catch (error) {
    console.error('Error getting document URL:', error);
    return '';
  }
};

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to determine file type icon
export const getFileTypeIcon = (fileType: string | null): string => {
  if (!fileType) return 'document';
  
  if (fileType.startsWith('image/')) return 'image';
  if (fileType.includes('pdf')) return 'pdf';
  if (fileType.includes('excel') || fileType.includes('spreadsheet') || fileType.includes('csv')) return 'spreadsheet';
  if (fileType.includes('word') || fileType.includes('doc')) return 'word';
  
  return 'document';
};

/**
 * Categorizes documents by their category property
 */
export const categorizeDocuments = (documents: Document[]): Record<string, Document[]> => {
  const documentsByCategory: Record<string, Document[]> = {};
  
  documents.forEach(doc => {
    const category = doc.category || 'Other';
    if (!documentsByCategory[category]) {
      documentsByCategory[category] = [];
    }
    documentsByCategory[category].push(doc);
  });
  
  return documentsByCategory;
};

/**
 * Filters documents based on whether they are line item documents or not
 */
export const filterDocumentsByType = (
  documents: Document[], 
  isLineItemDocument: boolean
): Document[] => {
  return documents.filter(doc => 
    Boolean((doc as any).item_id || (doc as any).item_reference) === isLineItemDocument
  );
};

/**
 * Determines if a document is associated with a line item
 */
export const isLineItemDocument = (document: Document): boolean => {
  // Check for item_id or item_reference in the document
  return Boolean(
    (document as any).item_id || 
    (document as any).item_reference
  );
};
