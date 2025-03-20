
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import workOrderSchema, { WorkOrderFormValues } from './WorkOrderFormSchema';
import { useWorkOrderData } from './hooks/useWorkOrderData';
import { useWorkOrderSubmit } from './hooks/useWorkOrderSubmit';
import { useEffect } from 'react';

interface UseWorkOrderFormProps {
  onOpenChange: (open: boolean) => void;
  onWorkOrderAdded: () => void;
}

const useWorkOrderForm = ({ onOpenChange, onWorkOrderAdded }: UseWorkOrderFormProps) => {
  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
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
    },
    mode: 'onChange',
  });

  const {
    formData,
    dataLoaded,
    isLoading,
    fetchData
  } = useWorkOrderData();

  const { isSubmitting, onSubmit } = useWorkOrderSubmit({
    onWorkOrderAdded,
    onOpenChange,
    resetForm: form.reset
  });

  const useCustomAddress = form.watch('use_custom_address');
  
  // Log form values for debugging
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      console.log(`Field ${name} changed (${type}):`, value);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  return {
    form,
    isSubmitting,
    formData,
    useCustomAddress,
    fetchData,
    onSubmit,
    dataLoaded,
    isLoading
  };
};

export default useWorkOrderForm;
