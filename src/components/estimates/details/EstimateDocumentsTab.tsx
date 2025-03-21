
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Document } from '@/components/documents/schemas/documentSchema';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';

// Import our refactored components
import EmptyState from './documents/EmptyState';
import LoadingState from './documents/LoadingState';
import DocumentTabs from './documents/DocumentTabs';

// Import utility functions
import {
  getDocumentIcon,
  formatFileSize,
  getCategoryBadgeColor,
  formatCategoryName,
  getVendorTypeDisplay
} from './documents/utils';

interface EstimateDocumentsTabProps {
  estimateId: string;
  documents?: Document[];
  onDocumentAdded?: () => void;
}

const EstimateDocumentsTab: React.FC<EstimateDocumentsTabProps> = ({ 
  estimateId, 
  documents = [],
  onDocumentAdded
}) => {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Group documents by category for better organization
  const documentsByCategory = documents.reduce((acc: Record<string, Document[]>, doc) => {
    const category = doc.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(doc);
    return acc;
  }, {});
  
  // Group by vendor/subcontractor
  const documentsByVendor = documents.reduce((acc: Record<string, Document[]>, doc) => {
    if (doc.vendor_id && doc.vendor_type) {
      const key = `${doc.vendor_type}-${doc.vendor_id}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(doc);
    }
    return acc;
  }, {});

  // Function to handle opening document
  const openDocument = (url: string) => {
    if (!url) {
      toast({
        title: "Error",
        description: "Document URL is not available",
        variant: "destructive"
      });
      return;
    }
    window.open(url, '_blank');
  };
  
  const handleUploadSuccess = (documentId?: string) => {
    toast({
      title: "Document Uploaded",
      description: "The document has been successfully attached to this estimate.",
    });
    setShowUploadForm(false);
    setIsLoading(false);
    if (onDocumentAdded) {
      onDocumentAdded();
    }
  };

  const startUpload = () => {
    setShowUploadForm(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Related Documents</CardTitle>
        <Button 
          variant="outline"
          size="sm"
          onClick={() => setShowUploadForm(!showUploadForm)}
          className={showUploadForm ? "text-red-500 border-red-200" : "text-[#0485ea] border-[#0485ea]"}
        >
          {showUploadForm ? (
            <>
              <Upload className="h-4 w-4 mr-1" />
              Cancel Upload
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-1" />
              Upload Document
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState />
        ) : showUploadForm ? (
          <EnhancedDocumentUpload 
            entityType="ESTIMATE"
            entityId={estimateId}
            onSuccess={handleUploadSuccess}
            onCancel={() => setShowUploadForm(false)}
            onStartUpload={() => setIsLoading(true)}
          />
        ) : documents.length === 0 ? (
          <EmptyState startUpload={startUpload} />
        ) : (
          <DocumentTabs
            documentsByCategory={documentsByCategory}
            documentsByVendor={documentsByVendor}
            openDocument={openDocument}
            getDocumentIcon={getDocumentIcon}
            formatFileSize={formatFileSize}
            getCategoryBadgeColor={getCategoryBadgeColor}
            formatCategoryName={formatCategoryName}
            getVendorTypeDisplay={getVendorTypeDisplay}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default EstimateDocumentsTab;
