
import React, { useState, useEffect, useRef } from 'react';
import { Form } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDeviceCapabilities } from '@/hooks/use-mobile';
import { EntityType, DocumentUploadFormValues } from './schemas/documentSchema';

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
  instanceId?: string;
}

const EnhancedDocumentUpload = React.memo(({
  entityType,
  entityId,
  onSuccess,
  onCancel,
  isReceiptUpload = false,
  prefillData,
  instanceId = 'default-upload'
}: EnhancedDocumentUploadProps) => {
  const [showMobileCapture, setShowMobileCapture] = useState(false);
  const { isMobile, hasCamera } = useDeviceCapabilities();
  const formSubmitted = useRef(false);
  
  // Use the custom hook for form management with instanceId passed through
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
    handleCancel
  } = useDocumentUploadForm({
    entityType,
    entityId,
    onSuccess,
    onCancel,
    isReceiptUpload,
    prefillData,
    instanceId
  });

  // Initialize form with prefill data if available
  useEffect(() => {
    initializeForm();
    formSubmitted.current = false;
    
    // Return a cleanup function to reset form when component unmounts
    return () => {
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
      }
    };
  }, [isReceiptUpload, prefillData, entityId, instanceId, initializeForm, previewURL]);

  // Auto-show vendor selector when receipt category is selected
  useEffect(() => {
    if (watchCategory === 'receipt' || watchCategory === 'invoice') {
      setShowVendorSelector(true);
    }
  }, [watchCategory, setShowVendorSelector]);

  // Handle capture from mobile device
  const handleMobileCapture = (file: File) => {
    handleFileSelect([file]);
    setShowMobileCapture(false);
  };

  // If prefill data is available and it's a receipt upload, simplify the UI
  const simplifiedUpload = isReceiptUpload && prefillData;

  // Handle form submission with STRONG event prevention
  const handleFormSubmit = (e: React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Prevent double submissions
    if (formSubmitted.current || isUploading) {
      return;
    }
    
    formSubmitted.current = true;
    form.handleSubmit((data: DocumentUploadFormValues) => {
      onSubmit(data);
    })(e);
  };

  // Handle cancel with proper cleanup
  const handleCancelUpload = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    handleCancel();
  };

  // Create a unique form ID for this specific instance
  const formId = `document-form-${instanceId}`;

  return (
    <Card 
      className={`w-full ${isUploading ? 'uploading' : ''}`} 
      onClick={(e) => e.stopPropagation()}
    >
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
        <form onSubmit={handleFormSubmit} onClick={(e) => e.stopPropagation()} id={formId}>
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
                  instanceId={`dropzone-${instanceId}`}
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
                  instanceId={instanceId}
                />
              </div>
            </ScrollArea>
          </CardContent>
          
          <CardFooter className="flex justify-between mt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelUpload}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit" 
              className={`bg-[#0485ea] hover:bg-[#0375d1] ${isUploading ? 'uploading' : ''}`}
              disabled={isUploading || watchFiles.length === 0}
              form={formId}
            >
              {isUploading ? "Uploading..." : (isReceiptUpload ? "Upload Receipt" : "Upload Document")}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
});

// Add display name
EnhancedDocumentUpload.displayName = 'EnhancedDocumentUpload';

export default EnhancedDocumentUpload;
