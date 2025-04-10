
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Receipt } from 'lucide-react';
import DocumentUploadDirectSheet from '@/components/timeTracking/DocumentUploadDirectSheet';
import { EntityType } from './schemas/documentSchema';

interface MobileDocumentUploadButtonProps {
  entityType?: EntityType;
  entityId?: string;
  onSuccess?: (documentId?: string) => void;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  buttonText?: string;
  className?: string;
  isReceiptOnly?: boolean;
  disabled?: boolean;
}

const MobileDocumentUploadButton: React.FC<MobileDocumentUploadButtonProps> = ({
  entityType,
  entityId,
  onSuccess,
  buttonVariant = "outline",
  buttonText = "Upload Document",
  className = "",
  isReceiptOnly = false,
  disabled = false
}) => {
  const [open, setOpen] = React.useState(false);
  
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };
  
  const handleSuccess = (documentId?: string) => {
    setOpen(false);
    if (onSuccess) {
      onSuccess(documentId);
    }
  };
  
  return (
    <>
      <Button 
        variant={buttonVariant}
        size="sm"
        className={`justify-start ${className}`}
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        {isReceiptOnly ? (
          <Receipt className="h-4 w-4 mr-1" />
        ) : (
          <Upload className="h-4 w-4 mr-1" />
        )}
        {buttonText}
      </Button>
      
      <DocumentUploadDirectSheet
        open={open}
        onOpenChange={handleOpenChange}
        entityType={entityType}
        entityId={entityId}
        onSuccess={handleSuccess}
        title={isReceiptOnly ? "Upload Receipt" : "Upload Document or Receipt"}
        isReceiptUploadOnly={isReceiptOnly}
        description={isReceiptOnly 
          ? "Upload and categorize your receipt" 
          : "Upload and categorize your document or receipt"
        }
        showHelpText={true}
        allowEntityTypeSelection={true}
      />
    </>
  );
};

export default MobileDocumentUploadButton;
