
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText } from 'lucide-react';
import { Document, documentService, EntityType, categorizeDocuments } from '@/services/documentService';
import DocumentList from './DocumentList';
import DocumentViewer from './DocumentViewer';
import DocumentUpload from './DocumentUpload';

interface DocumentsSectionProps {
  entityType: EntityType;
  entityId: string;
  title?: string;
  description?: string;
  showMetrics?: boolean;
  onDocumentAdded?: () => void;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  entityType,
  entityId,
  title = 'Documents',
  description,
  showMetrics = false,
  onDocumentAdded
}) => {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [viewDocument, setViewDocument] = useState<Document | null>(null);
  const [docCounts, setDocCounts] = useState({
    total: 0,
    receipts: 0,
    invoices: 0,
    contracts: 0,
    other: 0
  });
  
  // Load documents on component mount
  React.useEffect(() => {
    fetchDocuments();
  }, [entityType, entityId]);
  
  // Fetch documents from the server
  const fetchDocuments = async () => {
    if (!entityId) return;
    
    setLoading(true);
    try {
      const docs = await documentService.getDocumentsByEntity(entityType, entityId);
      setDocuments(docs);
      
      // Calculate document counts for metrics
      if (showMetrics) {
        const categorized = categorizeDocuments(docs);
        setDocCounts({
          total: docs.length,
          receipts: categorized.receipts.length,
          invoices: categorized.invoices.length,
          contracts: categorized.contracts.length,
          other: categorized.other.length + categorized.general.length
        });
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle document upload success
  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    fetchDocuments();
    
    if (onDocumentAdded) {
      onDocumentAdded();
    }
  };
  
  // Handle view document
  const handleViewDocument = (document: Document) => {
    setViewDocument(document);
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{title}</CardTitle>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            <Button 
              variant={showUploadForm ? "outline" : "default"}
              className={showUploadForm 
                ? "text-[#0485ea] border-[#0485ea]/30 hover:bg-blue-50" 
                : "bg-[#0485ea] hover:bg-[#0375d1]"
              }
              onClick={() => setShowUploadForm(!showUploadForm)}
            >
              {showUploadForm ? (
                <>
                  <X className="h-4 w-4 mr-1" />
                  Cancel Upload
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-1" />
                  Upload Document
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {showUploadForm && (
            <div className="mb-6">
              <DocumentUpload 
                entityType={entityType}
                entityId={entityId}
                onSuccess={handleUploadSuccess}
                onCancel={() => setShowUploadForm(false)}
              />
            </div>
          )}
          
          {showMetrics && !showUploadForm && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="border rounded-lg p-3 text-center">
                <p className="text-2xl font-semibold text-[#0485ea]">{docCounts.total}</p>
                <p className="text-sm text-muted-foreground">Total Documents</p>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <p className="text-2xl font-semibold text-green-600">{docCounts.receipts}</p>
                <p className="text-sm text-muted-foreground">Receipts</p>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <p className="text-2xl font-semibold text-amber-600">{docCounts.invoices}</p>
                <p className="text-sm text-muted-foreground">Invoices</p>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <p className="text-2xl font-semibold text-purple-600">{docCounts.contracts}</p>
                <p className="text-sm text-muted-foreground">Contracts</p>
              </div>
            </div>
          )}
          
          <DocumentList 
            documents={documents}
            loading={loading}
            onViewDocument={handleViewDocument}
          />
          
          {documents.length === 0 && !loading && !showUploadForm && (
            <div className="text-center py-8">
              <FileText className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-muted-foreground">No documents have been added yet</p>
              <Button 
                variant="outline" 
                className="mt-4 text-[#0485ea] border-[#0485ea] hover:bg-[#0485ea]/10"
                onClick={() => setShowUploadForm(true)}
              >
                <Upload className="h-4 w-4 mr-1" />
                Add First Document
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <DocumentViewer 
        document={viewDocument}
        open={!!viewDocument}
        onOpenChange={(open) => {
          if (!open) setViewDocument(null);
        }}
      />
    </div>
  );
};

export default DocumentsSection;
