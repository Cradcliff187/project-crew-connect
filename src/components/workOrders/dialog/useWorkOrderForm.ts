
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import workOrderSchema, { WorkOrderFormValues } from './WorkOrderFormSchema';
import { useWorkOrderData } from './hooks/useWorkOrderData';
import { useWorkOrderSubmit } from './hooks/useWorkOrderSubmit';
import { useEffect } from 'react';

interface UseWorkOrderFormProps {
  onOpenChange: (open: boolean) => void;
  onWorkOrderAdded: () => void;
  isOpen: boolean;
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
  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  });

  const {
    formData,
    dataLoaded,
    isLoading,
  } = useWorkOrderData(isOpen);

  const { isSubmitting, onSubmit } = useWorkOrderSubmit({
    onWorkOrderAdded,
    onOpenChange,
    resetForm: form.reset
  });

  const useCustomAddress = form.watch('use_custom_address');
  
  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      form.reset(DEFAULT_VALUES);
    }
  }, [isOpen, form]);

  return {
    form,
    isSubmitting,
    formData,
    useCustomAddress,
    dataLoaded,
    isLoading,
    onSubmit
  };
};

export default useWorkOrderForm;
