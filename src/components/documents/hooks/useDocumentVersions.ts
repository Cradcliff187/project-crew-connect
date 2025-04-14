import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '../schemas/documentSchema';

export const useDocumentVersions = (documentId?: string) => {
  const [versions, setVersions] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentVersion, setCurrentVersion] = useState<Document | null>(null);

  // Fetch document versions
  const fetchVersions = useCallback(async () => {
    if (!documentId) {
      setVersions([]);
      setCurrentVersion(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First fetch the current document to determine its parent_document_id
      const { data: currentDoc, error: currentDocError } = await supabase
        .from('documents')
        .select('*')
        .eq('document_id', documentId)
        .single();

      if (currentDocError) throw currentDocError;

      // Set the current version
      setCurrentVersion(currentDoc as Document);

      // Determine the root document ID (either the parent or this document if it's the parent)
      const rootDocId = currentDoc.parent_document_id || currentDoc.document_id;

      // Fetch all versions related to this document
      const { data: versionsData, error: versionsError } = await supabase
        .from('documents')
        .select('*')
        .or(`document_id.eq.${rootDocId},parent_document_id.eq.${rootDocId}`)
        .order('created_at', { ascending: false });

      if (versionsError) throw versionsError;

      // Process versions to get public URLs
      const versionsWithUrls = await Promise.all(
        (versionsData || []).map(async version => {
          // Get the public URL for the document
          const { data: urlData } = supabase.storage
            .from('construction_documents')
            .getPublicUrl(version.storage_path);

          return {
            ...version,
            file_url: urlData.publicUrl,
          } as Document;
        })
      );

      setVersions(versionsWithUrls);
    } catch (err: any) {
      console.error('Error fetching document versions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  // Upload a new version of a document
  const uploadNewVersion = async (file: File, metadata: Partial<Document>) => {
    if (!documentId || !currentVersion) {
      throw new Error('No document selected to version');
    }

    try {
      // Create a unique file name using timestamp and original name
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

      // Keep the same path structure as the original
      const entityTypePath = currentVersion.entity_type.toLowerCase().replace('_', '-');
      const entityId = currentVersion.entity_id || 'general';
      const filePath = `${entityTypePath}/${entityId}/${fileName}`;

      // Upload the file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('construction_documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('construction_documents').getPublicUrl(filePath);

      // Create document record with parent_document_id reference
      const documentData = {
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: filePath,
        entity_type: currentVersion.entity_type,
        entity_id: currentVersion.entity_id,
        tags: currentVersion.tags || [],
        category: currentVersion.category,
        version: (currentVersion.version || 1) + 1,
        parent_document_id: currentVersion.parent_document_id || currentVersion.document_id,
        is_latest_version: true,
        notes: metadata.notes || `Updated version of ${currentVersion.file_name}`,
      };

      // Insert the new version
      const { data: newVersion, error: insertError } = await supabase
        .from('documents')
        .insert(documentData)
        .select()
        .single();

      if (insertError) throw insertError;

      // The trigger will automatically set is_latest_version=false for older versions

      // Refresh the versions
      await fetchVersions();

      return {
        success: true,
        document: {
          ...newVersion,
          file_url: publicUrl,
        } as Document,
      };
    } catch (error: any) {
      console.error('Error uploading new version:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  };

  // Load versions on component mount or when documentId changes
  useEffect(() => {
    fetchVersions();
  }, [documentId, fetchVersions]);

  return {
    versions,
    currentVersion,
    loading,
    error,
    refetchVersions: fetchVersions,
    uploadNewVersion,
  };
};
