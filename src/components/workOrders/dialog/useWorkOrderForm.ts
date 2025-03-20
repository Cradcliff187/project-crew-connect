
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import workOrderSchema, { WorkOrderFormValues } from './WorkOrderFormSchema';
import { useWorkOrderData } from './hooks/useWorkOrderData';
import { useWorkOrderSubmit } from './hooks/useWorkOrderSubmit';
import { useEffect, useRef } from 'react';

interface UseWorkOrderFormProps {
  onOpenChange: (open: boolean) => void;
  onWorkOrderAdded: () => void;
  isOpen: boolean; // Add isOpen prop to control data fetching
}

const DEFAULT_VALUES: WorkOrderFormValues = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  po_number: '',
  time_estimate: 0,
  use_custom_address: false,
  address: '',
  city: '',
  state: '',
  zip: '',
};

const useWorkOrderForm = ({ onOpenChange, onWorkOrderAdded, isOpen }: UseWorkOrderFormProps) => {
  const initialized = useRef(false);
  
  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  });

  const {
    formData,
    dataLoaded,
    isLoading,
    fetchData
  } = useWorkOrderData(isOpen); // Pass isOpen to control fetching

  const { isSubmitting, onSubmit } = useWorkOrderSubmit({
    onWorkOrderAdded,
    onOpenChange,
    resetForm: form.reset
  });

  const useCustomAddress = form.watch('use_custom_address');
  
  // Only fetch data when dialog is opened and not already initialized
  useEffect(() => {
    if (isOpen && !initialized.current) {
      console.log('Dialog opened, initializing form...');
      
      // Reset the form once when dialog opens
      form.reset(DEFAULT_VALUES);
      
      // Mark as initialized to prevent multiple resets
      initialized.current = true;
    }
    
    // Reset the initialization flag when dialog closes
    if (!isOpen) {
      initialized.current = false;
    }
  }, [isOpen, form]);

  return {
    form,
    isSubmitting,
    formData,
    useCustomAddress,
    dataLoaded,
    isLoading
  };
};

export default useWorkOrderForm;
