
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ProjectDocument } from './types';

export const useProjectDocuments = (projectId: string) => {
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      // Fetch documents from the documents table, filtered by project_id as entity_id
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('entity_type', 'PROJECT')
        .eq('entity_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match our ProjectDocument interface
      const projectDocuments: ProjectDocument[] = data.map(doc => ({
        id: doc.document_id,
        project_id: doc.entity_id,
        file_name: doc.file_name,
        file_type: doc.file_type || '',
        file_size: doc.file_size || 0,
        file_url: doc.storage_path,
        uploaded_by: doc.uploaded_by || '',
        created_at: doc.created_at,
        description: doc.notes,
        category: doc.category
      }));
      
      setDocuments(projectDocuments);
    } catch (error: any) {
      console.error('Error fetching project documents:', error);
      toast({
        title: 'Error loading documents',
        description: error.message,
        variant: 'destructive'
      });
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (projectId) {
      fetchDocuments();
    }
  }, [projectId]);
  
  return { documents, loading, fetchDocuments };
};
