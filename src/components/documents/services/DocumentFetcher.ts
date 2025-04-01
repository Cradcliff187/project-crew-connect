
import { DocumentService } from './DocumentService';
import { Document } from '../schemas/documentSchema';

interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
}

interface FetchDocumentOptions {
  imageOptions?: ImageOptions;
  expiresIn?: number; // in seconds
}

/**
 * Fetches a document by ID and generates a signed URL
 * Uses the DocumentService for consistent handling
 */
export async function fetchDocumentWithUrl(
  documentId: string,
  options: FetchDocumentOptions = {}
): Promise<Document | null> {
  try {
    console.log('Fetching document with ID:', documentId);
    
    // Fetch document and generate signed URL using DocumentService
    return await DocumentService.getDocumentById(documentId);
  } catch (error) {
    console.error('Error in fetchDocumentWithUrl:', error);
    return null;
  }
}

/**
 * Fetches multiple documents by IDs
 * Uses the DocumentService for consistent handling
 */
export async function fetchDocumentsWithUrls(
  documentIds: string[],
  options: FetchDocumentOptions = {}
): Promise<Document[]> {
  if (!documentIds.length) return [];
  
  try {
    console.log('Fetching multiple documents:', documentIds);
    
    // Fetch all documents in parallel
    const documents = await Promise.all(
      documentIds.map(id => DocumentService.getDocumentById(id))
    );
    
    // Filter out any nulls (failed fetches)
    return documents.filter(Boolean) as Document[];
  } catch (error) {
    console.error('Error in fetchDocumentsWithUrls:', error);
    return [];
  }
}
