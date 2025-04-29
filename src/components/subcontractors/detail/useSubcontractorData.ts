import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Subcontractor } from '../utils/types';
import useSubcontractorSpecialties from '../hooks/useSubcontractorSpecialties';
import { useSubcontractorAssociatedData } from './hooks/useSubcontractorAssociatedData';
import { Database } from '@/integrations/supabase/types';

type DocumentRow = Database['public']['Tables']['documents']['Row'];

interface UseSubcontractorDataReturn {
  subcontractor: Subcontractor | null;
  loading: boolean;
  notFound: boolean;
  specialtyIds: string[];
  projects: any[];
  workOrders: any[];
  loadingAssociations: boolean;
  fetchSubcontractor: () => void;
  documents: DocumentRow[];
  loadingDocuments: boolean;
}

const useSubcontractorData = (subcontractorId: string | undefined): UseSubcontractorDataReturn => {
  const [subcontractor, setSubcontractor] = useState<Subcontractor | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);

  const { specialtyIds, loading: loadingSpecialties } =
    useSubcontractorSpecialties(subcontractorId);

  const {
    projects,
    workOrders,
    loading: loadingAssociations,
    fetchAssociatedData,
  } = useSubcontractorAssociatedData();

  const fetchSubcontractor = useCallback(async () => {
    if (!subcontractorId) {
      setLoading(false);
      setLoadingDocuments(false);
      setNotFound(true);
      return;
    }

    setLoading(true);
    setLoadingDocuments(true);
    setNotFound(false);
    setDocuments([]);

    try {
      const { data, error } = await supabase
        .from('subcontractors')
        .select('*')
        .eq('subid', subcontractorId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSubcontractor(data);
        fetchAssociatedData(subcontractorId);
      } else {
        setNotFound(true);
      }

      try {
        const { data: docsData, error: docsError } = await supabase
          .from('documents')
          .select('*')
          .eq('entity_type', 'SUBCONTRACTOR')
          .eq('entity_id', subcontractorId)
          .order('created_at', { ascending: false });

        if (docsError) throw docsError;

        const docsWithUrls = await Promise.all(
          (docsData || []).map(async doc => {
            let publicUrl = '';
            try {
              const { data: urlData } = supabase.storage
                .from('construction_documents')
                .getPublicUrl(doc.storage_path);
              publicUrl = urlData.publicUrl;
            } catch (err) {
              console.error('Error getting public URL:', err);
            }
            return {
              ...doc,
              url: publicUrl,
              file_url: publicUrl,
              is_latest_version: doc.is_latest_version ?? true,
              mime_type: doc.file_type || 'application/octet-stream',
            } as DocumentRow;
          })
        );
        setDocuments(docsWithUrls);
      } catch (error) {
        console.error('Error fetching subcontractor documents:', error);
        setDocuments([]);
      } finally {
        setLoadingDocuments(false);
      }
    } catch (error) {
      console.error('Error fetching subcontractor:', error);
      setNotFound(true);
      setDocuments([]);
      setLoadingDocuments(false);
    } finally {
      setLoading(false);
    }
  }, [subcontractorId, fetchAssociatedData]);

  useEffect(() => {
    fetchSubcontractor();
  }, [fetchSubcontractor]);

  return {
    subcontractor,
    loading: loading || loadingSpecialties || loadingAssociations,
    notFound,
    specialtyIds,
    projects,
    workOrders,
    loadingAssociations,
    fetchSubcontractor,
    documents,
    loadingDocuments,
  };
};

export default useSubcontractorData;
