
import React, { useState, useEffect, useCallback } from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDeviceCapabilities } from '@/hooks/use-mobile';
import { EntityType } from './schemas/documentSchema';

// Import refactored components
import DropzoneUploader from './components/DropzoneUploader';
import MetadataForm from './components/MetadataForm';
import MobileCaptureWrapper from './components/MobileCaptureWrapper';
import { useDocumentUploadForm } from './hooks/useDocumentUploadForm';

interface EnhancedDocumentUploadProps {
  entityType?: EntityType;
  entityId?: string;
  onSuccess?: (documentId?: string) => void;
  onCancel?: () => void;
  isReceiptUpload?: boolean;
  prefillData?: {
    amount?: number;
    vendorId?: string;
    materialName?: string;
    expenseName?: string;
    notes?: string;
    category?: string;
    tags?: string[];
    budgetItemId?: string;
    parentEntityType?: string;
    parentEntityId?: string;
    expenseType?: string; // Added expenseType to the interface
  };
  preventFormPropagation?: boolean;
  allowEntityTypeSelection?: boolean;
  onEntityTypeChange?: (entityType: EntityType) => void;
}

const EnhancedDocumentUpload: React.FC<EnhancedDocumentUploadProps> = ({
  entityType,
  entityId,
  onSuccess,
  onCancel,
  isReceiptUpload = false,
  prefillData,
  preventFormPropagation = false,
  allowEntityTypeSelection = false,
  onEntityTypeChange
}) => {
  const [showMobileCapture, setShowMobileCapture] = useState(false);
  const { isMobile, hasCamera } = useDeviceCapabilities();

  // Use the custom hook for form management
  const {
    form,
    isUploading,
    previewURL,
    showVendorSelector,
    setShowVendorSelector,
    handleFileSelect,
    onSubmit,
    initializeForm,
    handleCancel,
    handleFormSubmit,
    availableCategories,
    watchIsExpense,
    watchVendorType,
    watchFiles,
    watchCategory,
    watchExpenseType,
    watchEntityType
  } = useDocumentUploadForm({
    entityType,
    entityId,
    onSuccess,
    onCancel,
    isReceiptUpload,
    prefillData,
    allowEntityTypeSelection,
    preventFormPropagation,
    onEntityTypeChange
  });

  // Handle capture from mobile device
  const handleMobileCapture = useCallback((file: File) => {
    handleFileSelect([file]);
    setShowMobileCapture(false);
  }, [handleFileSelect]);

  // If prefill data is available and it's a receipt upload, simplify the UI
  const simplifiedUpload = isReceiptUpload && prefillData;

  // Click handler for buttons to prevent event bubbling
  const handleButtonClick = useCallback((e: React.MouseEvent) => {
    if (preventFormPropagation) {
      e.stopPropagation();
    }
  }, [preventFormPropagation]);

  // Get the proper title based on context
  const getTitle = () => {
    if (isReceiptUpload) return "Upload Receipt";
    
    if (watchEntityType === 'VENDOR' || watchEntityType === 'SUBCONTRACTOR') {
      return `Upload ${watchEntityType === 'VENDOR' ? 'Vendor' : 'Subcontractor'} Document`;
    }
    
    return "Upload Document";
  };

  // Get the proper description based on context
  const getDescription = () => {
    if (isReceiptUpload) {
      return "Upload receipts for expenses related to this work order or project.";
    }
    
    if (watchEntityType === 'VENDOR') {
      return "Upload documents related to this vendor such as certifications or contracts.";
    }
    
    if (watchEntityType === 'SUBCONTRACTOR') {
      return "Upload documents related to this subcontractor such as insurance, certifications or contracts.";
    }
    
    if (watchEntityType === 'PROJECT') {
      return "Upload documents for this project such as photos, contracts or specifications.";
    }
    
    if (watchEntityType === 'WORK_ORDER') {
      return "Upload documents for this work order such as receipts, photos or contracts.";
    }
    
    if (watchEntityType === 'ESTIMATE') {
      return "Upload documents for this estimate such as contracts, specifications or reference materials.";
    }
    
    return "Upload and categorize documents for your projects, invoices, and more.";
  };

  return (
    <Card 
      className="w-full"
      onClick={preventFormPropagation ? (e) => e.stopPropagation() : undefined}
    >
      {!simplifiedUpload && (
        <CardHeader>
          <CardTitle>{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
      )}
      
      <Form {...form}>
        <form onSubmit={handleFormSubmit}>
          <CardContent className="p-0">
            <ScrollArea className="h-[60vh] px-6 py-4 md:max-h-[500px]">
              <div className="space-y-6">
                {/* File Uploader Component */}
                <DropzoneUploader 
                  control={form.control}
                  onFileSelect={handleFileSelect}
                  previewURL={previewURL}
                  watchFiles={watchFiles}
                  label={getTitle()}
                />
                
                {/* Mobile Capture Component */}
                <MobileCaptureWrapper
                  onCapture={handleMobileCapture}
                  isMobile={isMobile}
                  hasCamera={hasCamera}
                  showMobileCapture={showMobileCapture}
                  setShowMobileCapture={setShowMobileCapture}
                />
                
                {/* Metadata Form Component */}
                <MetadataForm
                  form={form}
                  control={form.control}
                  watchIsExpense={watchIsExpense}
                  watchVendorType={watchVendorType}
                  watchCategory={watchCategory}
                  watchEntityType={watchEntityType}
                  isReceiptUpload={isReceiptUpload}
                  showVendorSelector={showVendorSelector}
                  prefillData={prefillData}
                  allowEntityTypeSelection={allowEntityTypeSelection}
                />
              </div>
            </ScrollArea>
          </CardContent>
          
          <CardFooter className="flex justify-between mt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCancel();
                }}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit" 
              className="bg-[#0485ea] hover:bg-[#0375d1]"
              disabled={isUploading || watchFiles.length === 0}
              onClick={handleButtonClick}
            >
              {isUploading ? "Uploading..." : (
                isReceiptUpload ? "Upload Receipt" : `Upload ${watchCategory || 'Document'}`
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default React.memo(EnhancedDocumentUpload);
