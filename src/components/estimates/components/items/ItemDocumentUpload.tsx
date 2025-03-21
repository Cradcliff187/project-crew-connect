
import React, { useState } from 'react';
import { Control, useController } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';

interface ItemDocumentUploadProps {
  index: number;
  control: Control<EstimateFormValues>;
  itemType: string;
}

const ItemDocumentUpload = ({ index, control, itemType }: ItemDocumentUploadProps) => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { field } = useController({
    control,
    name: `items.${index}.document`,
    defaultValue: undefined,
  });

  const handleDocumentUpload = (documentId?: string) => {
    // Update form field with the uploaded document's ID
    field.onChange(documentId);
    setIsUploadOpen(false);
  };

  const getLabelForUpload = () => {
    if (itemType === 'subcontractor') {
      return "Subcontractor Estimate";
    }
    return "Attach Document";
  };

  return (
    <div className="mt-2">
      {!field.value && (
        <button 
          type="button" 
          onClick={() => setIsUploadOpen(true)}
          className="text-sm text-[#0485ea] hover:underline"
        >
          {getLabelForUpload()}
        </button>
      )}
      
      {isUploadOpen && (
        <EnhancedDocumentUpload 
          entityType="ESTIMATE"
          entityId={null}  // We'll set this when the estimate is created
          onSuccess={handleDocumentUpload}
          onCancel={() => setIsUploadOpen(false)}
          isReceiptUpload={false}
          prefillData={{
            category: itemType === 'subcontractor' ? 'subcontractor_estimate' : 'estimate'
          }}
        />
      )}

      {field.value && (
        <div className="flex items-center text-xs p-2 bg-blue-50 rounded border border-blue-200">
          <span className="flex-1 truncate">Document uploaded</span>
          <button 
            type="button" 
            onClick={() => field.onChange(undefined)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
};

export default ItemDocumentUpload;
