
import React from 'react';
import { Control } from 'react-hook-form';
import { DocumentUploadFormValues, VendorType } from '../schemas/documentSchema';
import { DocumentFormProps, PrefillData } from '../types/documentTypes';
import DocumentCategorySelector from '../DocumentCategorySelector';
import ExpenseForm from '../ExpenseForm';
import VendorSelector from '../VendorSelector';

interface MetadataFormProps extends DocumentFormProps {
  watchIsExpense: boolean;
  watchVendorType: string;
  isReceiptUpload?: boolean;
  showVendorSelector: boolean;
  prefillData?: PrefillData;
}

const MetadataForm: React.FC<MetadataFormProps> = ({
  control,
  watchIsExpense,
  watchVendorType,
  isReceiptUpload = false,
  showVendorSelector,
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
      
      {/* Vendor Selector - shown based on category or isExpense */}
      {showVendorSelector && (
        <VendorSelector 
          control={control}
          vendorType={watchVendorType}
          prefillVendorId={prefillData?.vendorId}
          prefillVendorType={prefillData?.vendorType as VendorType}
        />
      )}
    </div>
  );
};

export default MetadataForm;
