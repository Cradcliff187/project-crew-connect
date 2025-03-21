
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
      
      // Fetch documents from the database
      const { data, error } = await supabase
        .from('project_documents')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setDocuments(data as ProjectDocument[]);
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
