import { Document } from '@/components/documents/schemas/documentSchema';

/**
 * Determines if a document is associated with a line item
 */
export const isLineItemDocument = (document: Document): boolean => {
  return !!(document.item_id || document.item_reference);
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
  showLineItemDocuments: boolean
): Document[] => {
  return showLineItemDocuments
    ? documents.filter(isLineItemDocument)
    : documents.filter(doc => !isLineItemDocument(doc));
};
