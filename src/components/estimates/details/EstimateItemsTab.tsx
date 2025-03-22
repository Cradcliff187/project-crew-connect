
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import EstimateItems from '../EstimateItems';
import { EstimateItem } from '../types/estimateTypes';
import { Document } from '@/components/documents/schemas/documentSchema';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';

interface EstimateItemsTabProps {
  items: EstimateItem[];
  itemDocuments?: Record<string, Document[]>;
  estimateId: string;
  onDocumentsUpdated?: () => void;
}

const EstimateItemsTab: React.FC<EstimateItemsTabProps> = ({ 
  items, 
  itemDocuments = {},
  estimateId,
  onDocumentsUpdated
}) => {
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

  const handleDocumentUploadSuccess = () => {
    setShowDocumentUpload(false);
    if (onDocumentsUpdated) {
      onDocumentsUpdated();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Line Items</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowDocumentUpload(true)}
          className="text-[#0485ea] border-[#0485ea] hover:bg-[#0485ea]/10"
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Add Document
        </Button>
      </CardHeader>
      <CardContent>
        <EstimateItems 
          items={items} 
          itemDocuments={itemDocuments} 
          estimateId={estimateId}
          onDocumentAdded={onDocumentsUpdated}
        />
      </CardContent>

      {/* General Document Upload Dialog */}
      <Dialog open={showDocumentUpload} onOpenChange={setShowDocumentUpload}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Document to Estimate</DialogTitle>
          </DialogHeader>
          <EnhancedDocumentUpload
            entityType="ESTIMATE"
            entityId={estimateId}
            onSuccess={handleDocumentUploadSuccess}
            onCancel={() => setShowDocumentUpload(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EstimateItemsTab;
