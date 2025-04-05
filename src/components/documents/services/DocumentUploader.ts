
import { supabase } from '@/integrations/supabase/client';
import { DocumentUploadFormValues } from '../schemas/documentSchema';
import { v4 as uuidv4 } from 'uuid';

interface UploadResult {
  success: boolean;
  documentId?: string;
  error?: Error;
}

export const uploadDocument = async (data: DocumentUploadFormValues): Promise<UploadResult> => {
  try {
    const { files, metadata } = data;
    const file = files[0]; // Currently we only support uploading one file at a time
    
    // Generate a unique ID for the document
    const documentId = uuidv4();
    
    // Generate a storage path that includes entity info for better organization
    const entityType = metadata.entityType.toLowerCase();
    const entityId = metadata.entityId;
    const timestamp = Date.now();
    const filePath = `${entityType}/${entityId}/${documentId}_${timestamp}_${file.name}`;
    
    // Upload the file to Supabase Storage
    const { error: uploadError } = await supabase
      .storage
      .from('construction_documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Error uploading to storage:', uploadError);
      throw uploadError;
    }
    
    // Format the date field properly
    let expenseDate = null;
    if (metadata.expenseDate) {
      expenseDate = metadata.expenseDate instanceof Date
        ? metadata.expenseDate.toISOString()
        : new Date(metadata.expenseDate).toISOString();
    }
    
    // Insert document metadata into the database
    const { error: dbError } = await supabase
      .from('documents')
      .insert({
        document_id: documentId,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: filePath,
        entity_type: metadata.entityType,
        entity_id: metadata.entityId,
        category: metadata.category,
        is_expense: metadata.isExpense,
        tags: metadata.tags || [],
        expense_date: expenseDate,
        amount: metadata.amount,
        notes: metadata.notes,
        vendor_id: metadata.vendorId,
        vendor_type: metadata.vendorType,
        expense_type: metadata.expenseType,
        budget_item_id: metadata.budgetItemId,
        version: 1,
        is_latest_version: true
      });
    
    if (dbError) {
      console.error('Error inserting document metadata:', dbError);
      throw dbError;
    }
    
    // If document is linked to an expense or budget item, update relationships
    if (metadata.isExpense || metadata.category === 'receipt' || metadata.category === 'invoice') {
      await updateExpenseRelationships(documentId, metadata);
    }

    // If this document has a parent entity, create a relationship
    if (metadata.parentEntityType && metadata.parentEntityId) {
      await createParentEntityRelationship(documentId, metadata);
    }
    
    console.log('Document upload completed successfully');
    
    return {
      success: true,
      documentId
    };
    
  } catch (error: any) {
    console.error('Document upload failed:', error);
    return {
      success: false,
      error
    };
  }
};

// Helper to update expense relationships
const updateExpenseRelationships = async (documentId: string, metadata: any) => {
  try {
    // If we have a budget item ID, update it with this document
    if (metadata.budgetItemId) {
      // Create expense data object with all required fields
      const expenseData = {
        entity_type: metadata.entityType,
        entity_id: metadata.entityId,
        expense_type: metadata.expenseType || 'other',
        document_id: documentId,
        vendor_id: metadata.vendorId,
        expense_date: metadata.expenseDate,
        description: metadata.notes || `${metadata.category} document`,
        amount: metadata.amount || 0,
        budget_item_id: metadata.budgetItemId,
        is_receipt: metadata.category === 'receipt',
        // Add required unit_price field
        unit_price: metadata.amount || 0,
        // Default quantity to 1 if not provided
        quantity: 1
      };
        
      const { error } = await supabase
        .from('expenses')
        .insert(expenseData);
        
      if (error) {
        console.error('Error creating expense relationship:', error);
      }
    }
  } catch (error) {
    console.error('Error in updateExpenseRelationships:', error);
  }
};

// Helper to create parent entity relationship
const createParentEntityRelationship = async (documentId: string, metadata: any) => {
  try {
    // Create a document relationship
    const { error } = await supabase
      .from('document_relationships')
      .insert({
        source_document_id: documentId,
        target_document_id: null, // We don't have a target document, just establishing parent relationship
        relationship_type: 'PARENT_ENTITY',
        relationship_metadata: {
          parent_entity_type: metadata.parentEntityType,
          parent_entity_id: metadata.parentEntityId,
          description: 'Document belongs to this parent entity'
        }
      });
      
    if (error) {
      console.error('Error creating parent entity relationship:', error);
    }
  } catch (error) {
    console.error('Error in createParentEntityRelationship:', error);
  }
};
