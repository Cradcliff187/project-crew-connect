
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EstimateRevision } from '../../types/estimateTypes';

export function useEstimateDialogState(estimateId: string, clientId?: string) {
  const [activeTab, setActiveTab] = useState('details');
  const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(1);
  const [clientEmail, setClientEmail] = useState<string | undefined>(undefined);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);

  // Find the current version from revisions
  const updateCurrentVersion = (revisions: EstimateRevision[]) => {
    const currentRevision = revisions.find(rev => rev.is_current);
    if (currentRevision) {
      setCurrentVersion(currentRevision.version);
    }
  };
  
  // Fetch client email when the estimate dialog opens
  useEffect(() => {
    const fetchClientEmail = async () => {
      if (clientId) {
        try {
          const { data, error } = await supabase
            .from('contacts')
            .select('email')
            .eq('id', clientId)
            .single();
            
          if (data && !error) {
            setClientEmail(data.email);
          }
        } catch (err) {
          console.error("Error fetching client email:", err);
        }
      }
    };
    
    fetchClientEmail();
  }, [clientId]);

  const handleCreateRevision = () => {
    setRevisionDialogOpen(true);
  };

  const handleShareDocument = (document: any) => {
    setSelectedDocument(document);
    setShareDialogOpen(true);
  };

  return {
    activeTab,
    setActiveTab,
    revisionDialogOpen,
    setRevisionDialogOpen,
    currentVersion,
    setCurrentVersion,
    updateCurrentVersion,
    clientEmail,
    shareDialogOpen,
    setShareDialogOpen,
    selectedDocument,
    handleCreateRevision,
    handleShareDocument,
  };
}
