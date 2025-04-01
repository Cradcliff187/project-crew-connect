
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { EntityType } from '../schemas/documentSchema';

export const useDocumentUpload = (
  entityType: EntityType,
  entityId?: string,
  options?: {
    onSuccess?: () => void;
    redirectAfterUpload?: boolean;
    autoGenerateId?: boolean;
  }
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadDocument = async (
    file: File,
    metadata: {
      category?: string;
      tags?: string[];
      notes?: string;
      isExpense?: boolean;
    } = {}
  ) => {
    try {
      setLoading(true);
      setError(null);
      setProgress(0);

      // Generate a file path based on entity type and ID
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      // Use the provided entityId or generate a temp one if autoGenerateId is true
      const id = entityId || (options?.autoGenerateId ? uuidv4() : '');
      const finalEntityId = id || 'general';
      
      // Format entity type for storage path (lowercase with hyphens)
      const formattedEntityType = entityType.toLowerCase().replace(/_/g, '-');
      const filePath = `${formattedEntityType}/${finalEntityId}/${fileName}`;

      // Upload the file to storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('construction_documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (storageError) {
        throw new Error(`Storage error: ${storageError.message}`);
      }

      // Insert a record in the documents table
      const { data: document, error: documentError } = await supabase
        .from('documents')
        .insert({
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: filePath,
          entity_type: entityType,
          entity_id: finalEntityId,
          category: metadata.category || null,
          tags: metadata.tags || [],
          notes: metadata.notes || null,
          is_expense: metadata.isExpense || false,
          version: 1, // Initial version
          is_latest_version: true,
        })
        .select()
        .single();

      if (documentError) {
        throw new Error(`Document error: ${documentError.message}`);
      }

      // Get public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('construction_documents')
        .getPublicUrl(filePath);

      // Call success callback if provided
      if (options?.onSuccess) {
        options.onSuccess();
      }

      toast({
        title: "Document uploaded successfully",
        description: `${file.name} has been uploaded.`,
      });

      // Return the document with public URL
      return {
        ...document,
        url: publicUrlData.publicUrl,
      };
    } catch (err: any) {
      console.error('Error uploading document:', err);
      setError(err.message || 'Failed to upload document');
      
      toast({
        title: "Upload failed",
        description: err.message || 'Something went wrong while uploading the document',
        variant: "destructive",
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    uploadDocument,
    loading,
    error,
    progress,
  };
};
