
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatFileSize } from '@/lib/utils';
import { 
  Clock, 
  FileIcon, 
  ChevronDown, 
  ChevronUp, 
  ChevronRight,
  Check
} from 'lucide-react';
import { Document } from './schemas/documentSchema';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

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
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (documentId) {
      fetchVersionHistory();
    }
  }, [documentId]);

  const fetchVersionHistory = async () => {
    try {
      setLoading(true);
      
      // First, find the original document to get its parent_document_id
      const { data: currentDoc, error: currentError } = await supabase
        .from('documents')
        .select('*')
        .eq('document_id', documentId)
        .single();
        
      if (currentError) throw currentError;
      
      const rootId = currentDoc.parent_document_id || currentDoc.document_id;
      
      // Then fetch all versions related to either this ID or the parent ID
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .or(`document_id.eq.${rootId},parent_document_id.eq.${rootId}`)
        .order('version', { ascending: false });
        
      if (error) throw error;
      
      // Get signed URLs for each document
      const docsWithUrls = await Promise.all(
        data.map(async (doc) => {
          const { data: urlData } = await supabase
            .storage
            .from('construction_documents')
            .getPublicUrl(doc.storage_path);
            
          return {
            ...doc,
            url: urlData.publicUrl
          };
        })
      );
      
      setVersions(docsWithUrls);
    } catch (error) {
      console.error('Error fetching document versions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load document versions.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVersionSelect = (document: Document) => {
    if (onVersionChange) {
      onVersionChange(document);
    }
  };
  
  // Check if the current document is in our versions list
  const currentVersion = versions.find(v => v.document_id === documentId)?.version || 1;

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>Version History</span>
            <Skeleton className="h-4 w-6" />
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-3 space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>Version History</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      {expanded && (
        <CardContent className="pb-3 max-h-[350px] overflow-y-auto space-y-2">
          {versions.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-3">
              No version history available
            </div>
          ) : (
            versions.map((version) => (
              <div 
                key={version.document_id}
                className={`p-2 border rounded-md ${
                  version.document_id === documentId 
                    ? 'bg-accent/50 border-accent' 
                    : 'hover:bg-accent/20 cursor-pointer'
                }`}
                onClick={() => version.document_id !== documentId && handleVersionSelect(version)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium">
                          Version {version.version || 1}
                        </span>
                        {version.document_id === documentId && (
                          <Badge variant="outline" className="ml-2 text-xs">Current</Badge>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(version.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  {version.document_id === documentId ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                
                <div className="mt-1 text-xs text-muted-foreground">
                  {formatFileSize(version.file_size || 0)}
                </div>
              </div>
            ))
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default DocumentVersionHistoryCard;
