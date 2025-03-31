
import React, { useState, useEffect } from 'react';
import { Form } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
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
  instanceId?: string; // Added instanceId prop
}

const EnhancedDocumentUpload: React.FC<EnhancedDocumentUploadProps> = ({
  entityType,
  entityId,
  onSuccess,
  onCancel,
  isReceiptUpload = false,
  prefillData,
  instanceId = 'default-upload'
}) => {
  const [showMobileCapture, setShowMobileCapture] = useState(false);
  const { isMobile, hasCamera } = useDeviceCapabilities();
  
  // Log props for debugging
  console.log(`EnhancedDocumentUpload [${instanceId}] props:`, { 
    entityType, 
    entityId, 
    isReceiptUpload, 
    prefillData 
  });

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
    watchExpenseType
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
    console.log(`[${instanceId}] Initializing form with entity ID: ${entityId}`);
    initializeForm();
    
    // Return a cleanup function to reset form when component unmounts
    return () => {
      console.log(`[${instanceId}] Cleaning up on unmount`);
      form.reset();
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
      }
    };
  }, [isReceiptUpload, prefillData, entityId, instanceId]);

  // Auto-show vendor selector when receipt category is selected
  useEffect(() => {
    if (watchCategory === 'receipt' || watchCategory === 'invoice') {
      setShowVendorSelector(true);
    }
  }, [watchCategory]);

  // Handle capture from mobile device
  const handleMobileCapture = (file: File) => {
    handleFileSelect([file]);
    setShowMobileCapture(false);
  };

  // If prefill data is available and it's a receipt upload, simplify the UI
  const simplifiedUpload = isReceiptUpload && prefillData;

  // Handle form submission with STRONG event prevention
  const handleFormSubmit = (e: React.FormEvent) => {
    e.stopPropagation(); // Stop event bubbling to parent forms first
    e.preventDefault(); // Then prevent default behavior
    
    console.log(`[${instanceId}] Document upload form submit triggered`);
    form.handleSubmit((data) => {
      console.log(`[${instanceId}] Document form data being submitted:`, data);
      onSubmit(data);
    })(e);
  };

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
        <form onSubmit={handleFormSubmit} onClick={(e) => e.stopPropagation()} id={`document-form-${instanceId}`}>
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
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel();
                }}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit" 
              className={`bg-[#0485ea] hover:bg-[#0375d1] ${isUploading ? 'uploading' : ''}`}
              disabled={isUploading || watchFiles.length === 0}
              onClick={(e) => e.stopPropagation()}
              form={`document-form-${instanceId}`}
            >
              {isUploading ? "Uploading..." : (isReceiptUpload ? "Upload Receipt" : "Upload Document")}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default EnhancedDocumentUpload;
