
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/components/documents/schemas/documentSchema';
import { Badge } from '@/components/ui/badge';
import { File, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface EstimateDocumentsTabProps {
  estimateId: string;
}

const EstimateDocumentsTab: React.FC<EstimateDocumentsTabProps> = ({ estimateId }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        // Fetch all documents related to this estimate
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('entity_type', 'ESTIMATE')
          .eq('entity_id', estimateId);

        if (error) {
          throw error;
        }

        // Get document URLs
        const docsWithUrls = await Promise.all(data.map(async (doc) => {
          const { data: { publicUrl } } = supabase.storage
            .from('construction_documents')
            .getPublicUrl(doc.storage_path);
          
          return { ...doc, url: publicUrl };
        }));

        setDocuments(docsWithUrls);
      } catch (error) {
        console.error('Error fetching estimate documents:', error);
      } finally {
        setLoading(false);
      }
    };

    if (estimateId) {
      fetchDocuments();
    }
  }, [estimateId]);

  const openDocument = (url: string) => {
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Related Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-gray-100 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Related Documents</CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No documents attached to this estimate.
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.document_id} className="flex items-center p-3 border rounded-md bg-white">
                <div className="p-2 bg-blue-50 rounded-md mr-3">
                  <File className="h-5 w-5 text-[#0485ea]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{doc.file_name}</h4>
                  <div className="flex items-center mt-1">
                    <Badge variant="outline" className="mr-2">
                      {doc.category || 'Other'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(doc.created_at)}
                    </span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-[#0485ea]"
                  onClick={() => openDocument(doc.url || '')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EstimateDocumentsTab;
