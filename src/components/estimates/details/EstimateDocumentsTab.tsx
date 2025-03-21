
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Plus, File, FileText, Download, Trash2 } from 'lucide-react';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Document } from '@/components/documents/schemas/documentSchema';
import { cn } from '@/lib/utils';

interface EstimateDocumentsTabProps {
  estimateId?: string;
}

const EstimateDocumentsTab: React.FC<EstimateDocumentsTabProps> = ({ estimateId }) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
  
  // Fetch documents when component mounts or estimateId changes
  useEffect(() => {
    if (estimateId) {
      fetchDocuments();
    } else {
      setDocuments([]);
      setIsLoading(false);
    }
  }, [estimateId]);

  const fetchDocuments = async () => {
    if (!estimateId) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('entity_type', 'ESTIMATE')
        .eq('entity_id', estimateId);
        
      if (error) throw error;
      
      // Generate URLs for the documents
      const docsWithUrls = await Promise.all(
        (data || []).map(async (doc) => {
          const { data: { publicUrl } } = supabase.storage
            .from('construction_documents')
            .getPublicUrl(doc.storage_path);
            
          return { ...doc, url: publicUrl };
        })
      );
      
      setDocuments(docsWithUrls as Document[]);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Error fetching documents',
        description: 'Unable to load documents at this time.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = (documentId?: string) => {
    setShowUploadForm(false);
    fetchDocuments();
    toast({
      title: 'Document uploaded',
      description: 'Document was successfully attached to this estimate.'
    });
  };

  const handleDeleteDocument = async (documentId: string, storagePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('construction_documents')
        .remove([storagePath]);
        
      if (storageError) throw storageError;
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('document_id', documentId);
        
      if (dbError) throw dbError;
      
      // Update documents list
      setDocuments(documents.filter(doc => doc.document_id !== documentId));
      
      toast({
        title: 'Document deleted',
        description: 'Document was successfully removed.'
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error deleting document',
        description: 'Unable to delete document at this time.',
        variant: 'destructive'
      });
    }
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getFileIcon = (fileType: string | null): JSX.Element => {
    if (fileType?.startsWith('image/')) {
      return <File className="h-10 w-10 text-[#0485ea]" />;
    } else if (fileType?.includes('pdf')) {
      return <FileText className="h-10 w-10 text-[#0485ea]" />;
    } else {
      return <File className="h-10 w-10 text-[#0485ea]" />;
    }
  };

  if (showUploadForm) {
    return (
      <Card className={isMobile ? "px-2" : ""}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upload Document</CardTitle>
          <Button 
            variant="outline" 
            onClick={() => setShowUploadForm(false)}
            size="sm"
          >
            Cancel
          </Button>
        </CardHeader>
        <CardContent>
          <EnhancedDocumentUpload
            entityType="ESTIMATE"
            entityId={estimateId}
            onSuccess={handleUploadSuccess}
            onCancel={() => setShowUploadForm(false)}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={isMobile ? "px-2" : ""}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Related Documents</CardTitle>
        {estimateId && (
          <Button 
            onClick={() => setShowUploadForm(true)}
            size="sm"
            className="bg-[#0485ea] hover:bg-[#0373ce]"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Document
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0485ea]"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No documents attached to this estimate.
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div 
                key={doc.document_id} 
                className={cn(
                  "flex items-start space-x-4 p-4 rounded-md",
                  "border border-gray-200 hover:bg-gray-50 transition-colors"
                )}
              >
                {getFileIcon(doc.file_type)}
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{doc.file_name}</h4>
                  <div className="flex mt-1 text-xs text-muted-foreground">
                    <span>{formatFileSize(doc.file_size)}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                    {doc.category && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="capitalize">{doc.category}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <a 
                    href={doc.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#0485ea] hover:text-[#0373ce]"
                  >
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </a>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteDocument(doc.document_id, doc.storage_path)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
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
