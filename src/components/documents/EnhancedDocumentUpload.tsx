
import React, { useState, useEffect } from 'react';
import { Form } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useDeviceCapabilities } from '@/hooks/use-mobile';
import { EntityType, DocumentCategory } from './schemas/documentSchema';

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
  onStartUpload?: () => void; // Added this property to fix the TypeScript error
  isReceiptUpload?: boolean;
  prefillData?: {
    amount?: number;
    vendorId?: string;
    materialName?: string;
    category?: DocumentCategory;
  };
}

const EnhancedDocumentUpload: React.FC<EnhancedDocumentUploadProps> = ({
  entityType,
  entityId,
  onSuccess,
  onCancel,
  onStartUpload,
  isReceiptUpload = false,
  prefillData
}) => {
  const [showMobileCapture, setShowMobileCapture] = useState(false);
  const { isMobile, hasCamera } = useDeviceCapabilities();
  
  // Log props for debugging
  console.log('EnhancedDocumentUpload props:', { 
    entityType, 
    entityId, 
    isReceiptUpload, 
    prefillData 
  });

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
    watchCategory
  } = useDocumentUploadForm({
    entityType,
    entityId,
    onSuccess,
    onCancel,
    isReceiptUpload,
    prefillData,
    onStartUpload, // Pass the onStartUpload prop to the hook
  });

  // Initialize form with prefill data if available
  useEffect(() => {
    initializeForm();
  }, [isReceiptUpload, prefillData]);

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

  return (
    <Card className="w-full">
      {!simplifiedUpload && (
        <CardHeader>
          <CardTitle>{isReceiptUpload ? "Upload Receipt" : "Upload Document"}</CardTitle>
          <CardDescription>
            {isReceiptUpload 
              ? "Upload receipts for materials or expenses related to this work order."
              : "Upload and categorize documents for your projects, invoices, and more."}
          </CardDescription>
        </CardHeader>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 pt-4">
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
              control={form.control}
              watchIsExpense={watchIsExpense}
              watchVendorType={watchVendorType}
              isReceiptUpload={isReceiptUpload}
              showVendorSelector={showVendorSelector}
              prefillData={prefillData}
            />
          </CardContent>
          
          <CardFooter className="flex justify-between">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit" 
              className="bg-[#0485ea] hover:bg-[#0375d1]"
              disabled={isUploading || watchFiles.length === 0}
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
