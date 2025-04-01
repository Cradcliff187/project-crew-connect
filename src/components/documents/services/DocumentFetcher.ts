
import { supabase, DOCUMENTS_BUCKET_ID } from '@/integrations/supabase/client';
import { Document } from '../schemas/documentSchema';

interface FetchDocumentOptions {
  imageOptions?: {
    width?: number;
    height?: number;
    quality?: number;
  };
  expiresIn?: number; // URL expiration time in seconds
}

/**
 * Fetch a document by ID and generate a signed URL
 */
export async function fetchDocumentWithUrl(
  documentId: string,
  options: FetchDocumentOptions = {}
): Promise<Document | null> {
  try {
    // Fetch document metadata
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('document_id', documentId)
      .single();
      
    if (error) throw error;
    if (!document) return null;
    
    // Get signed URL with provided options
    if (document.storage_path) {
      const { expiresIn = 300, imageOptions } = options;
      
      // Default transform options for images
      const transformOptions = document.file_type?.startsWith('image/') ? {
        width: imageOptions?.width || 1200,
        height: imageOptions?.height || 1200,
        quality: imageOptions?.quality || 80,
      } : undefined;
      
      const { data: urlData } = await supabase.storage
        .from(DOCUMENTS_BUCKET_ID)
        .createSignedUrl(document.storage_path, expiresIn, {
          download: false,
          transform: transformOptions
        });
        
      if (urlData) {
        return {
          ...document,
          url: urlData.signedUrl
        } as Document;
      }
    }
    
    return document as Document;
  } catch (error) {
    console.error('Error in fetchDocumentWithUrl:', error);
    return null;
  }
}

/**
 * Fetch documents by entity type and ID with signed URLs
 */
export async function fetchDocumentsByEntity(
  entityType: string,
  entityId: string,
  options: FetchDocumentOptions = {}
): Promise<Document[]> {
  try {
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId);
      
    if (error) throw error;
    if (!documents || documents.length === 0) return [];
    
    // Get signed URLs for all documents
    const { expiresIn = 300 } = options;
    
    const enhancedDocuments = await Promise.all(
      documents.map(async (doc) => {
        if (doc.storage_path) {
          // Generate transform options based on file type
          const isImage = doc.file_type?.startsWith('image/');
          const transformOptions = isImage ? options.imageOptions : undefined;
          
          const { data: urlData } = await supabase.storage
            .from(DOCUMENTS_BUCKET_ID)
            .createSignedUrl(doc.storage_path, expiresIn, {
              download: false,
              transform: transformOptions
            });
            
          if (urlData) {
            return {
              ...doc,
              url: urlData.signedUrl
            };
          }
        }
        
        return {
          ...doc,
          url: ''
        };
      })
    );
    
    return enhancedDocuments as Document[];
  } catch (error) {
    console.error('Error in fetchDocumentsByEntity:', error);
    return [];
  }
}

/**
 * Fetch document versions (both parent and children)
 */
export async function fetchDocumentVersions(
  documentId: string,
  options: FetchDocumentOptions = {}
): Promise<Document[]> {
  try {
    // Get the document first to determine if it's a parent or child
    const document = await fetchDocumentWithUrl(documentId, options);
    if (!document) {
      throw new Error(`Document with ID ${documentId} not found`);
    }
    
    // Array to store all versions
    let versionDocuments: Document[] = [document];
    
    // If this is a child document, get the parent and siblings
    if (document.parent_document_id) {
      // Get parent document
      const parent = await fetchDocumentWithUrl(document.parent_document_id, options);
      if (parent) {
        versionDocuments.push(parent);
      }
      
      // Get other child documents with the same parent
      const { data: siblings, error } = await supabase
        .from('documents')
        .select('*')
        .eq('parent_document_id', document.parent_document_id)
        .neq('document_id', document.document_id);
        
      if (!error && siblings && siblings.length > 0) {
        // Get URLs for siblings
        const siblingDocs = await Promise.all(
          siblings.map(async (doc) => {
            if (doc.storage_path) {
              const { data: urlData } = await supabase.storage
                .from(DOCUMENTS_BUCKET_ID)
                .createSignedUrl(doc.storage_path, options.expiresIn || 300);
                
              if (urlData) {
                return { ...doc, url: urlData.signedUrl };
              }
            }
            return { ...doc, url: '' };
          })
        );
        
        versionDocuments = [...versionDocuments, ...siblingDocs];
      }
    } 
    // If this is a parent document, get all children
    else {
      const { data: children, error } = await supabase
        .from('documents')
        .select('*')
        .eq('parent_document_id', document.document_id);
        
      if (!error && children && children.length > 0) {
        // Get URLs for children
        const childDocs = await Promise.all(
          children.map(async (doc) => {
            if (doc.storage_path) {
              const { data: urlData } = await supabase.storage
                .from(DOCUMENTS_BUCKET_ID)
                .createSignedUrl(doc.storage_path, options.expiresIn || 300);
                
              if (urlData) {
                return { ...doc, url: urlData.signedUrl };
              }
            }
            return { ...doc, url: '' };
          })
        );
        
        versionDocuments = [...versionDocuments, ...childDocs];
      }
    }
    
    // Sort by version number (highest/latest first)
    return versionDocuments.sort((a, b) => (b.version || 1) - (a.version || 1));
  } catch (error) {
    console.error('Error in fetchDocumentVersions:', error);
    return [];
  }
}

/**
 * Ensure the storage bucket exists
 */
export async function ensureStorageBucket(): Promise<boolean> {
  try {
    // Check if the bucket exists
    const { data: buckets, error } = await supabase
      .storage
      .listBuckets();
      
    if (error) throw error;
    
    // Check if our bucket exists
    const bucketExists = buckets.some(bucket => bucket.name === DOCUMENTS_BUCKET_ID);
    
    if (!bucketExists) {
      // Create the bucket if it doesn't exist
      const { error: createError } = await supabase
        .storage
        .createBucket(DOCUMENTS_BUCKET_ID, {
          public: false,
          fileSizeLimit: 52428800 // 50MB
        });
        
      if (createError) throw createError;
    }
    
    return true;
  } catch (error) {
    console.error('Error in ensureStorageBucket:', error);
    return false;
  }
}
