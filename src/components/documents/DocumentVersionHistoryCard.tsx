
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Clock, FileClock } from 'lucide-react';
import { Document } from './schemas/documentSchema';
import { supabase } from '@/integrations/supabase/client';

interface DocumentVersionHistoryCardProps {
  documentId: string;
  onVersionChange?: (document: Document) => void;
}

const DocumentVersionHistoryCard: React.FC<DocumentVersionHistoryCardProps> = ({
  documentId,
  onVersionChange
}) => {
  const [versions, setVersions] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentVersionId, setCurrentVersionId] = useState<string>(documentId);
  
  useEffect(() => {
    const fetchVersions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .or(`document_id.eq.${documentId},parent_document_id.eq.${documentId}`)
          .order('version', { ascending: false });
        
        if (error) throw error;
        
        // Convert DB results to Documents
        const documentVersions = data.map(doc => ({
          ...doc,
          entity_type: doc.entity_type as any // TODO: Fix typing in the long term
        })) as Document[];
        
        setVersions(documentVersions);
        
        // Set current version to the latest version by default
        const latestVersion = documentVersions.find(doc => doc.is_latest_version);
        if (latestVersion) {
          setCurrentVersionId(latestVersion.document_id);
        } else if (documentVersions.length > 0) {
          setCurrentVersionId(documentVersions[0].document_id);
        }
      } catch (error) {
        console.error('Error fetching document versions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (documentId) {
      fetchVersions();
    }
  }, [documentId]);
  
  const handleVersionClick = (document: Document) => {
    setCurrentVersionId(document.document_id);
    if (onVersionChange) {
      onVersionChange(document);
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileClock className="h-5 w-5" />
            Version History
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-[#0485ea]" />
        </CardContent>
      </Card>
    );
  }
  
  if (versions.length <= 1) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileClock className="h-5 w-5" />
            Version History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No version history available.</p>
            <p className="text-sm mt-1">This is the only version of this document.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileClock className="h-5 w-5" />
          Version History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {versions
            .sort((a, b) => ((b.version || 1) - (a.version || 1)))
            .map((version) => (
              <div key={version.document_id} className="flex flex-col">
                <Button
                  variant={version.document_id === currentVersionId ? "default" : "outline"}
                  className={version.document_id === currentVersionId ? 
                    "bg-[#0485ea] hover:bg-[#0375d1] justify-between" : 
                    "justify-between"
                  }
                  onClick={() => handleVersionClick(version)}
                >
                  <div className="flex items-center">
                    <span>Version {version.version || 1}</span>
                    {version.is_latest_version && (
                      <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                        Latest
                      </span>
                    )}
                  </div>
                  <span className="text-xs">
                    {version.updated_at ? 
                      new Date(version.updated_at).toLocaleDateString() : 
                      new Date(version.created_at || '').toLocaleDateString()
                    }
                  </span>
                </Button>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentVersionHistoryCard;
