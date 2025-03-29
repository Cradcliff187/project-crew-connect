
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaperclipIcon, UploadIcon, FileTextIcon, FileIcon, FileImageIcon, EyeIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDocumentViewer } from "@/hooks/useDocumentViewer";
import { Document } from "@/components/documents/schemas/documentSchema";
import DocumentPreviewCard from "@/components/documents/DocumentPreviewCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useDocumentCount } from "@/hooks/useDocumentCount";

interface EstimateDocumentsTabProps {
  estimateId: string;
}

const EstimateDocumentsTab: React.FC<EstimateDocumentsTabProps> = ({ estimateId }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const { count } = useDocumentCount("ESTIMATE", estimateId);
  
  const { 
    viewDocument, 
    closeViewer, 
    isViewerOpen, 
    currentDocument 
  } = useDocumentViewer();

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!estimateId) return;
      
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('entity_type', 'ESTIMATE')
          .eq('entity_id', estimateId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setDocuments(data as Document[]);
      } catch (error) {
        console.error('Error fetching estimate documents:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, [estimateId]);

  // Get document icon based on file type
  const getDocumentIcon = (fileType?: string) => {
    if (!fileType) return <FileIcon className="h-4 w-4" />;
    
    if (fileType?.includes('image')) {
      return <FileImageIcon className="h-4 w-4" />;
    } else if (fileType?.includes('pdf')) {
      return <FileTextIcon className="h-4 w-4" />;
    }
    
    return <FileIcon className="h-4 w-4" />;
  };

  // Filter documents based on tab
  const filteredDocuments = documents.filter(doc => {
    if (activeTab === 'all') return true;
    return doc.category === activeTab;
  });

  // Get unique categories
  const categories = Array.from(new Set(documents.map(doc => doc.category || 'Uncategorized'))).filter(Boolean);

  // Group documents by category for display
  const documentsByCategory: Record<string, Document[]> = {};
  documents.forEach(doc => {
    const category = doc.category || 'Uncategorized';
    if (!documentsByCategory[category]) {
      documentsByCategory[category] = [];
    }
    documentsByCategory[category].push(doc);
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle>Estimate Documents</CardTitle>
          {count > 0 && (
            <Badge variant="outline" className="bg-blue-50">
              {count}
            </Badge>
          )}
        </div>
        
        <Button 
          variant="outline" 
          className="text-[#0485ea] border-[#0485ea]/30 hover:bg-blue-50"
          disabled
        >
          <UploadIcon className="h-4 w-4 mr-1" />
          Add Document
        </Button>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">Loading documents...</p>
          </div>
        ) : documents.length > 0 ? (
          <div className="space-y-6">
            {categories.length > 1 && (
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="all">All Documents</TabsTrigger>
                  {categories.map(category => (
                    <TabsTrigger key={category} value={category}>
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
            
            {activeTab === 'all' ? (
              <div className="space-y-6">
                {Object.entries(documentsByCategory).map(([category, docs]) => (
                  <div key={category} className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-600 capitalize">{category}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {docs.map(doc => (
                        <DocumentPreviewCard
                          key={doc.document_id}
                          document={doc}
                          onView={() => viewDocument(doc.document_id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredDocuments.map(doc => (
                  <DocumentPreviewCard
                    key={doc.document_id}
                    document={doc}
                    onView={() => viewDocument(doc.document_id)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="flex flex-col items-center gap-2">
              <PaperclipIcon className="h-10 w-10 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No documents attached to this estimate.</p>
              <p className="text-xs text-muted-foreground">
                Add documents to keep track of receipts, quotes, and other important files.
              </p>
            </div>
          </div>
        )}
      </CardContent>

      {/* Document Viewer Dialog */}
      <Dialog open={isViewerOpen} onOpenChange={closeViewer}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {currentDocument?.file_type && getDocumentIcon(currentDocument.file_type)}
              <span>{currentDocument?.file_name}</span>
            </DialogTitle>
          </DialogHeader>
          {currentDocument && (
            <div className="flex justify-center overflow-hidden">
              <iframe
                src={`${currentDocument.url}#toolbar=1`}
                className="w-full h-[70vh] border rounded"
                title={currentDocument.file_name}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EstimateDocumentsTab;
