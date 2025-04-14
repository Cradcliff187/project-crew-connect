import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { workOrderFormSchema, WorkOrderFormValues } from './WorkOrderFormSchema';

export const useWorkOrderForm = () => {
  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      title: '',
      work_order_number: '',
      description: '',
      priority: 'MEDIUM',
      po_number: '',
      scheduled_date: undefined,
      due_by_date: undefined,
      time_estimate: undefined,
      customer_id: '',
      location_id: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      assigned_to: '',
      useCustomAddress: false, // Use the correct property name from schema
    },
  });

  const resetForm = () => {
    form.reset({
      title: '',
      work_order_number: '',
      description: '',
      priority: 'MEDIUM',
      po_number: '',
      scheduled_date: undefined,
      due_by_date: undefined,
      time_estimate: undefined,
      customer_id: '',
      location_id: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      assigned_to: '',
      useCustomAddress: false, // Use the correct property name from schema
    });
  };

  // Use correct field name when watching form changes
  const useCustomAddress = form.watch('useCustomAddress');

  return {
    form,
    resetForm,
    useCustomAddress,
  };
};

export default useWorkOrderForm;
