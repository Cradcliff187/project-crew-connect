
import { useState } from 'react';
import BasicInfoStep from './BasicInfoStep';
import LocationFields from '../LocationFields';
import EstimateItemFields from '../EstimateItemFields';
import EstimateSummary from '../EstimateSummary';
import FormActions from './FormActions';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';

interface EditFormContentProps {
  customers: { id: string; name: string; address?: string; city?: string; state?: string; zip?: string; }[];
  selectedCustomerAddress: string | null;
  selectedCustomerName: string | null;
  customerTab: 'existing' | 'new';
  onNewCustomer: () => void;
  onExistingCustomer: () => void;
  onPreview: () => void;
  onCancel: () => void;
}

const EditFormContent = ({
  customers,
  selectedCustomerAddress,
  selectedCustomerName,
  customerTab,
  onNewCustomer,
  onExistingCustomer,
  onPreview,
  onCancel
}: EditFormContentProps) => {
  const form = useFormContext<EstimateFormValues>();
  const isNewCustomer = form.watch('isNewCustomer');
  const showSiteLocation = form.watch('showSiteLocation');

  return (
    <>
      <BasicInfoStep 
        customers={customers}
        selectedCustomerAddress={selectedCustomerAddress}
        selectedCustomerName={selectedCustomerName}
        onNewCustomer={onNewCustomer}
        onExistingCustomer={onExistingCustomer}
        customerTab={customerTab}
        isNewCustomer={isNewCustomer}
        showSiteLocation={showSiteLocation}
      />

      {(showSiteLocation || isNewCustomer || !selectedCustomerAddress) && (
        <LocationFields />
      )}

      <EstimateItemFields />

      <EstimateSummary />

      <FormActions onCancel={onCancel} onPreview={onPreview} />
    </>
  );
};

export default EditFormContent;
