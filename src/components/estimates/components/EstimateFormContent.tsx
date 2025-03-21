
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';

import BasicInfoFields from './BasicInfoFields';
import DescriptionField from './DescriptionField';
import LocationSection from './LocationSection';
import EstimateItemFields from './EstimateItemFields';
import EstimateSummary from './EstimateSummary';
import EstimateFormButtons from './EstimateFormButtons';

import { estimateFormSchema, type EstimateFormValues } from '../schemas/estimateFormSchema';
import { useEstimateSubmit } from '../hooks/useEstimateSubmit';

interface EstimateFormContentProps {
  onClose: () => void;
  customers: { id: string; name: string; address?: string; city?: string; state?: string; zip?: string }[];
  useCustomLocation: boolean;
  setUseCustomLocation: React.Dispatch<React.SetStateAction<boolean>>;
}

const EstimateFormContent = ({ onClose, customers, useCustomLocation, setUseCustomLocation }: EstimateFormContentProps) => {
  const { isSubmitting, submitEstimate } = useEstimateSubmit();
  const [selectedCustomerAddress, setSelectedCustomerAddress] = useState<{
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  } | null>(null);

  // Initialize the form
  const form = useForm<EstimateFormValues>({
    resolver: zodResolver(estimateFormSchema),
    defaultValues: {
      project: '',
      customer: '',
      description: '',
      contingency_percentage: '0',
      location: {
        address: '',
        city: '',
        state: '',
        zip: '',
      },
      items: [{ 
        description: '', 
        quantity: '1', 
        cost: '0',
        markup_percentage: '20',
        item_type: 'labor'
      }],
    },
  });

  // Handle customer selection to populate address if needed
  const handleCustomerChange = (customerId: string) => {
    form.setValue('customer', customerId);
    
    const selectedCustomer = customers.find(c => c.id === customerId);
    
    if (selectedCustomer) {
      setSelectedCustomerAddress({
        address: selectedCustomer.address,
        city: selectedCustomer.city,
        state: selectedCustomer.state,
        zip: selectedCustomer.zip
      });
      
      if (!useCustomLocation) {
        form.setValue('location.address', selectedCustomer.address || '');
        form.setValue('location.city', selectedCustomer.city || '');
        form.setValue('location.state', selectedCustomer.state || '');
        form.setValue('location.zip', selectedCustomer.zip || '');
      }
    }
  };

  // Handle toggle for custom location
  const handleCustomLocationToggle = (checked: boolean) => {
    setUseCustomLocation(checked);
    
    if (checked) {
      // Clear location fields when custom location is selected
      form.setValue('location.address', '');
      form.setValue('location.city', '');
      form.setValue('location.state', '');
      form.setValue('location.zip', '');
    } else if (form.getValues('customer')) {
      // Reset to customer address when switching back
      const selectedCustomer = customers.find(c => c.id === form.getValues('customer'));
      if (selectedCustomer) {
        form.setValue('location.address', selectedCustomer.address || '');
        form.setValue('location.city', selectedCustomer.city || '');
        form.setValue('location.state', selectedCustomer.state || '');
        form.setValue('location.zip', selectedCustomer.zip || '');
      }
    }
  };

  // Handle form submission
  const onSubmit = async (data: EstimateFormValues) => {
    await submitEstimate(data, customers, onClose);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
        <BasicInfoFields 
          customers={customers}
          handleCustomerChange={handleCustomerChange}
        />
        
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <DescriptionField />
        </div>

        <LocationSection
          useCustomLocation={useCustomLocation}
          handleCustomLocationToggle={handleCustomLocationToggle}
          customerAddress={selectedCustomerAddress || undefined}
        />

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <EstimateItemFields />
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <EstimateSummary />
        </div>

        <EstimateFormButtons onCancel={onClose} isSubmitting={isSubmitting} />
      </form>
    </Form>
  );
};

export default EstimateFormContent;
