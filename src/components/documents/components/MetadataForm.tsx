
import React from 'react';
import { Control } from 'react-hook-form';
import { DocumentUploadFormValues } from '../schemas/documentSchema';
import { DocumentFormProps, PrefillData } from '../types/documentTypes';
import DocumentCategorySelector from '../DocumentCategorySelector';
import ExpenseForm from '../ExpenseForm';
import EntitySelector from '../EntitySelector';

interface MetadataFormProps extends DocumentFormProps {
  watchIsExpense: boolean;
  watchCategory: string;
  isReceiptUpload?: boolean;
  showVendorSelector: boolean;
  showSubcontractorSelector: boolean;
  prefillData?: PrefillData;
}

const MetadataForm: React.FC<MetadataFormProps> = ({
  control,
  watchIsExpense,
  watchCategory,
  isReceiptUpload = false,
  showVendorSelector,
  showSubcontractorSelector,
  prefillData
}) => {
  return (
    <div className="space-y-4">
      {/* Category Selector - hidden when simplified receipt upload */}
      {!isReceiptUpload && (
        <DocumentCategorySelector control={control} />
      )}
      
      {/* Expense Form - shown when isExpense is true or for receipts */}
      {(watchIsExpense || isReceiptUpload) && (
        <ExpenseForm 
          control={control}
          prefillAmount={prefillData?.amount}
        />
      )}
      
      {/* Vendor Selector - shown for material vendor documents */}
      {showVendorSelector && (
        <EntitySelector 
          control={control}
          entityType="VENDOR"
          fieldName="metadata.vendorId"
          label="Vendor"
          prefillEntityId={prefillData?.vendorId}
        />
      )}

      {/* Subcontractor Selector - shown for subcontractor documents */}
      {showSubcontractorSelector && (
        <EntitySelector 
          control={control}
          entityType="SUBCONTRACTOR"
          fieldName="metadata.subcontractorId"
          label="Subcontractor"
          prefillEntityId={prefillData?.subcontractorId}
        />
      )}
    </div>
  );
};

export default MetadataForm;
