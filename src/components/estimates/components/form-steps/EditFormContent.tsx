
import React from 'react';
import { useFormContext } from 'react-hook-form';
import BasicInfoStep from './BasicInfoStep';
import LineItemsStep from './LineItemsStep';
import DocumentsStep from './DocumentsStep';
import SummaryStep from './SummaryStep';
import EstimateFormButtons from '../EstimateFormButtons';

interface EditFormContentProps {
  customers: { id: string; name: string; address?: string; city?: string; state?: string; zip?: string; }[];
  selectedCustomerAddress: string | null;
  selectedCustomerName: string | null;
  selectedCustomerId?: string | null;
  customerTab: 'existing' | 'new';
  onNewCustomer: () => void;
  onExistingCustomer: () => void;
  onPreview: (e?: React.MouseEvent) => Promise<void>;
  onCancel: () => void;
}

/**
 * EditFormContent handles rendering the content of the estimate form in edit mode
 * This component is used within EstimateMultiStepForm
 */
const EditFormContent: React.FC<EditFormContentProps> = ({
  customers,
  selectedCustomerAddress,
  selectedCustomerName,
  selectedCustomerId,
  customerTab,
  onNewCustomer,
  onExistingCustomer,
  onPreview,
  onCancel
}) => {
  const { watch } = useFormContext();
  const formData = watch();

  return (
    <>
      <div className="space-y-6">
        <BasicInfoStep 
          customerTab={customerTab}
          onNewCustomer={onNewCustomer}
          onExistingCustomer={onExistingCustomer}
          customers={customers}
          loading={false}
          selectedCustomerAddress={selectedCustomerAddress}
        />
        
        <LineItemsStep />
        
        <SummaryStep />
        
        <DocumentsStep />
      </div>
      
      <div className="mt-8">
        <EstimateFormButtons 
          onCancel={onCancel} 
          onPreview={onPreview} 
          isSubmitting={false} 
          isPreviewing={true}
        />
      </div>
    </>
  );
};

export default EditFormContent;
