
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/components/documents/schemas/documentSchema';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { FileIcon, ImageIcon, XCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EstimateDocumentsTabProps {
  estimateId: string;
  onDocumentUploadSuccess?: () => void;
}

const EstimateDocumentsTab: React.FC<EstimateDocumentsTabProps> = ({ 
  estimateId,
  onDocumentUploadSuccess
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('entity_type', 'ESTIMATE')
        .eq('entity_id', estimateId);

      if (error) throw error;

      // Get the public URLs for each document
      const docsWithUrls = await Promise.all(
        (data || []).map(async (doc) => {
          if (doc.storage_path) {
            const { data: urlData } = supabase.storage
              .from('construction_documents')
              .getPublicUrl(doc.storage_path);
            
            return { ...doc, url: urlData.publicUrl };
          }
          return doc;
        })
      );

      setDocuments(docsWithUrls);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [estimateId]);

  const handleDocumentUploadSuccess = () => {
    fetchDocuments();
    if (onDocumentUploadSuccess) {
      onDocumentUploadSuccess();
    }
  };

  const handleViewDocument = (url: string) => {
    window.open(url, '_blank');
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('document_id', documentId);
      
      if (error) throw error;
      
      // Refresh document list
      fetchDocuments();
      if (onDocumentUploadSuccess) {
        onDocumentUploadSuccess();
      }
    } catch (err: any) {
      console.error('Error deleting document:', err);
      setError(err.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <EnhancedDocumentUpload 
            entityType="ESTIMATE"
            entityId={estimateId}
            onSuccess={handleDocumentUploadSuccess}
          />
        </div>

        {loading ? (
          <div className="text-center py-4">Loading documents...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">
            Error loading documents: {error}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No documents uploaded for this estimate.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div key={doc.document_id} className="border rounded-lg p-3 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    {doc.file_type?.includes('image') ? (
                      <ImageIcon className="h-5 w-5 mr-2 text-blue-500" />
                    ) : (
                      <FileIcon className="h-5 w-5 mr-2 text-gray-500" />
                    )}
                    <span className="font-medium truncate max-w-[180px]" title={doc.file_name}>
                      {doc.file_name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleDeleteDocument(doc.document_id)}
                  >
                    <XCircleIcon className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                
                {doc.vendor_id && (
                  <div className="text-xs text-gray-500 mb-2">
                    Associated with: {doc.vendor_type === 'vendor' ? 'Vendor' : 'Subcontractor'}
                  </div>
                )}
                
                <div className="mt-2 flex-grow">
                  {doc.file_type?.includes('image') && doc.url ? (
                    <div className="cursor-pointer" onClick={() => handleViewDocument(doc.url!)}>
                      <img
                        src={doc.url}
                        alt={doc.file_name}
                        className="w-full h-24 object-cover rounded"
                      />
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 mb-2">
                      {doc.file_type || 'Unknown file type'}
                    </div>
                  )}
                </div>
                
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => doc.url && handleViewDocument(doc.url)}
                  >
                    View Document
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EstimateDocumentsTab;
