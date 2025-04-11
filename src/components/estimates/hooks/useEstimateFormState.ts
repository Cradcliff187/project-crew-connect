
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { estimateFormSchema, type EstimateFormValues } from '../schemas/estimateFormSchema';

export const useEstimateFormState = (open: boolean) => {
  const [customerTab, setCustomerTab] = useState<'existing' | 'new'>('existing');

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
        unit_price: '0', 
        cost: '0', 
        markup_percentage: '0' 
      }],
      showSiteLocation: false,
      isNewCustomer: false,
      newCustomer: {
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
      },
      // Generate a temporary ID for document handling
      temp_id: "temp-" + Math.random().toString(36).substr(2, 9)
    },
  });

  // Use useCallback to create stable function references
  const resetForm = useCallback(() => {
    if (open) {
      form.reset({
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
          unit_price: '0', 
          cost: '0', 
          markup_percentage: '0' 
        }],
        showSiteLocation: false,
        isNewCustomer: false,
        newCustomer: {
          name: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          zip: '',
        },
        // Generate a new temporary ID
        temp_id: "temp-" + Math.random().toString(36).substr(2, 9)
      });
    }
  }, [form, open]);

  const handleNewCustomer = useCallback(() => {
    form.setValue('isNewCustomer', true);
    form.setValue('customer', '');
    setCustomerTab('new');
  }, [form]);

  const handleExistingCustomer = useCallback(() => {
    form.setValue('isNewCustomer', false);
    setCustomerTab('existing');
  }, [form]);

  return {
    form,
    customerTab,
    resetForm,
    handleNewCustomer,
    handleExistingCustomer
  };
};
