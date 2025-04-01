
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
  entityType: EntityType;
  entityId?: string;
  onSuccess?: (documentId?: string) => void;
  onCancel?: () => void;
  isReceiptUpload?: boolean;
  prefillData?: {
    amount?: number;
    vendorId?: string;
    materialName?: string;
    expenseName?: string;
  };
  preventFormPropagation?: boolean;
}

const EnhancedDocumentUpload: React.FC<EnhancedDocumentUploadProps> = ({
  entityType,
  entityId,
  onSuccess,
  onCancel,
  isReceiptUpload = false,
  prefillData,
  preventFormPropagation = false
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
    watchIsExpense,
    watchVendorType,
    watchFiles,
    watchCategory,
    watchExpenseType
  } = useDocumentUploadForm({
    entityType,
    entityId,
    onSuccess,
    onCancel,
    isReceiptUpload,
    prefillData
  });

  // Initialize form with prefill data if available
  useEffect(() => {
    initializeForm();
  }, [isReceiptUpload, prefillData, initializeForm]);

  // Auto-show vendor selector when receipt category is selected
  useEffect(() => {
    if (watchCategory === 'receipt' || watchCategory === 'invoice') {
      setShowVendorSelector(true);
    }
  }, [watchCategory]);

  // Handle capture from mobile device
  const handleMobileCapture = useCallback((file: File) => {
    handleFileSelect([file]);
    setShowMobileCapture(false);
  }, [handleFileSelect]);

  // If prefill data is available and it's a receipt upload, simplify the UI
  const simplifiedUpload = isReceiptUpload && prefillData;

  // Handle form submission with event prevention
  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault(); // Prevent event bubbling to parent forms
    e.stopPropagation(); // Stop propagation
    
    // Use the form submission handler from the custom hook
    form.handleSubmit((data) => {
      onSubmit(data);
    })(e);
  }, [form, onSubmit]);

  return (
    <Card className="w-full" onClick={preventFormPropagation ? (e) => e.stopPropagation() : undefined}>
      {!simplifiedUpload && (
        <CardHeader>
          <CardTitle>{isReceiptUpload ? "Upload Receipt" : "Upload Document"}</CardTitle>
          <CardDescription>
            {isReceiptUpload 
              ? "Upload receipts for expenses related to this work order."
              : "Upload and categorize documents for your projects, invoices, and more."}
          </CardDescription>
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
                  label={isReceiptUpload ? "Upload Receipt" : "Upload Document"}
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
                  isReceiptUpload={isReceiptUpload}
                  showVendorSelector={showVendorSelector}
                  prefillData={prefillData}
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
                  onCancel();
                }}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit" 
              className="bg-[#0485ea] hover:bg-[#0375d1]"
              disabled={isUploading || watchFiles.length === 0}
              onClick={(e) => {
                // Prevent the click from bubbling up to parent forms
                if (preventFormPropagation) {
                  e.stopPropagation();
                }
              }}
            >
              {isUploading ? "Uploading..." : (isReceiptUpload ? "Upload Receipt" : "Upload Document")}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default React.memo(EnhancedDocumentUpload);
