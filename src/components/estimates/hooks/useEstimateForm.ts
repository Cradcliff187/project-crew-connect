
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ESTIMATE_STEPS } from '../components/form-steps/EstimateStepConstants';
import { EstimateFormValues, estimateFormSchema } from '../schemas/estimateFormSchema';

export interface UseEstimateFormProps {
  open: boolean;
  onClose: () => void;
}

export const useEstimateForm = ({ open }: UseEstimateFormProps) => {
  const [currentStep, setCurrentStep] = useState(ESTIMATE_STEPS[0].id);
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
      items: [{ description: '', quantity: '1', unitPrice: '0', cost: '0', markup_percentage: '0' }],
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
    },
  });

  const resetForm = () => {
    if (open) {
      setCurrentStep(ESTIMATE_STEPS[0].id);
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
        items: [{ description: '', quantity: '1', unitPrice: '0', cost: '0', markup_percentage: '0' }],
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
      });
    }
  };

  const handleNewCustomer = () => {
    form.setValue('isNewCustomer', true);
    form.setValue('customer', '');
    setCustomerTab('new');
  };

  const handleExistingCustomer = () => {
    form.setValue('isNewCustomer', false);
    setCustomerTab('existing');
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 'basic-info':
        return form.trigger(['project', 'customer', 'description']);
      case 'line-items':
        return form.trigger(['items', 'contingency_percentage']);
      case 'summary':
        return Promise.resolve(true); // Summary step is just review, no validation needed
      case 'review':
        return Promise.resolve(true); // Preview step is also just review
      default:
        return Promise.resolve(true);
    }
  };

  return {
    form,
    currentStep,
    setCurrentStep,
    customerTab,
    resetForm,
    handleNewCustomer,
    handleExistingCustomer,
    validateCurrentStep,
    isFirstStep: currentStep === ESTIMATE_STEPS[0].id,
    isLastStep: currentStep === ESTIMATE_STEPS[ESTIMATE_STEPS.length - 1].id,
  };
};
