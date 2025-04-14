import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/components/documents/schemas/documentSchema';
import { toast } from '@/hooks/use-toast';

/**
 * Get a list of documents associated with an entity
 */
export async function getEntityDocuments(
  entityType: string,
  entityId: string
): Promise<Document[]> {
  try {
    console.log(`Fetching documents for ${entityType} ${entityId}`);

    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('entity_type', entityType.toUpperCase())
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get signed URLs for each document
    const docsWithUrls = await Promise.all(
      (documents || []).map(async doc => {
        const { data } = await supabase.storage
          .from('construction_documents')
          .getPublicUrl(doc.storage_path);

        return {
          ...doc,
          url: data.publicUrl,
        } as Document;
      })
    );

    return docsWithUrls;
  } catch (error) {
    console.error('Error fetching entity documents:', error);
    return [];
  }
}

/**
 * Get document counts for an entity
 */
export async function getEntityDocumentCounts(
  entityType: string,
  entityId: string
): Promise<{
  total: number;
  byCategory: Record<string, number>;
}> {
  try {
    // Get total document count
    const { count: total, error: countError } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('entity_type', entityType.toUpperCase())
      .eq('entity_id', entityId);

    if (countError) throw countError;

    // Get counts by category
    const { data: categoryCounts, error: categoryError } = await supabase
      .from('documents')
      .select('category')
      .eq('entity_type', entityType.toUpperCase())
      .eq('entity_id', entityId);

    if (categoryError) throw categoryError;

    const byCategory: Record<string, number> = {};

    categoryCounts?.forEach(doc => {
      const category = doc.category || 'general';
      byCategory[category] = (byCategory[category] || 0) + 1;
    });

    return {
      total: total || 0,
      byCategory,
    };
  } catch (error) {
    console.error('Error fetching document counts:', error);
    return {
      total: 0,
      byCategory: {},
    };
  }
}

/**
 * Get the most recent documents for an entity
 */
export async function getRecentEntityDocuments(
  entityType: string,
  entityId: string,
  limit: number = 5
): Promise<Document[]> {
  try {
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('entity_type', entityType.toUpperCase())
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Get signed URLs for each document
    const docsWithUrls = await Promise.all(
      (documents || []).map(async doc => {
        const { data } = await supabase.storage
          .from('construction_documents')
          .getPublicUrl(doc.storage_path);

        return {
          ...doc,
          url: data.publicUrl,
        } as Document;
      })
    );

    return docsWithUrls;
  } catch (error) {
    console.error('Error fetching recent entity documents:', error);
    return [];
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(documentId: string): Promise<{
  success: boolean;
  message?: string;
  hasReferences?: boolean;
}> {
  try {
    // First check if document is referenced by any other records
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('document_id', documentId)
      .single();

    if (docError) throw docError;

    // Check for references in expenses or time entries
    let hasReferences = false;
    let referenceType = '';

    if (document) {
      // Check expenses
      const { count: expenseCount, error: expError } = await supabase
        .from('expenses')
        .select('*', { count: 'exact', head: true })
        .eq('document_id', documentId);

      if (expError) throw expError;

      if (expenseCount && expenseCount > 0) {
        hasReferences = true;
        referenceType = 'expenses';
      }

      // Check time entry links
      const { count: timeEntryCount, error: timeError } = await supabase
        .from('time_entry_document_links')
        .select('*', { count: 'exact', head: true })
        .eq('document_id', documentId);

      if (timeError) throw timeError;

      if (timeEntryCount && timeEntryCount > 0) {
        hasReferences = true;
        referenceType = referenceType ? `${referenceType} and time entries` : 'time entries';
      }

      if (hasReferences) {
        return {
          success: false,
          message: `Cannot delete document because it is referenced by ${referenceType}.`,
          hasReferences: true,
        };
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('construction_documents')
        .remove([document.storage_path]);

      if (storageError) {
        console.error('Error deleting from storage:', storageError);
        // Continue anyway - we still want to remove the DB record
      }

      // Delete the document record
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('document_id', documentId);

      if (deleteError) throw deleteError;

      return {
        success: true,
        message: 'Document deleted successfully',
      };
    }

    return {
      success: false,
      message: 'Document not found',
    };
  } catch (error) {
    console.error('Error deleting document:', error);
    return {
      success: false,
      message: 'An error occurred while deleting the document',
    };
  }
}

/**
 * Force delete a document (even if it has references)
 */
export async function forceDeleteDocument(documentId: string): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    // Get document details first
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('document_id', documentId)
      .single();

    if (docError) throw docError;

    if (!document) {
      return { success: false, message: 'Document not found' };
    }

    // Remove references in expenses
    const { error: expError } = await supabase
      .from('expenses')
      .update({ document_id: null, receipt_document_id: null })
      .eq('document_id', documentId);

    if (expError) {
      console.error('Error updating expenses:', expError);
    }

    // Remove references in time entry links
    const { error: timeError } = await supabase
      .from('time_entry_document_links')
      .delete()
      .eq('document_id', documentId);

    if (timeError) {
      console.error('Error deleting time entry links:', timeError);
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('construction_documents')
      .remove([document.storage_path]);

    if (storageError) {
      console.error('Error deleting from storage:', storageError);
      // Continue anyway - we still want to remove the DB record
    }

    // Delete the document record
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('document_id', documentId);

    if (deleteError) throw deleteError;

    return {
      success: true,
      message: 'Document and all references deleted successfully',
    };
  } catch (error) {
    console.error('Error force deleting document:', error);
    return {
      success: false,
      message: 'An error occurred while deleting the document',
    };
  }
}
