
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { estimateFormSchema, EstimateFormValues } from '@/components/estimates/schemas/estimateFormSchema';
import { ESTIMATE_STEPS } from '@/components/estimates/components/form-steps/EstimateStepConstants';

interface UseEstimateFormProps {
  open: boolean;
  onClose: () => void;
  initialValues?: Partial<EstimateFormValues>;
}

export const useEstimateForm = ({ open, onClose, initialValues = {} }: UseEstimateFormProps) => {
  // Always use the multi-step form
  const [currentStep, setCurrentStep] = useState(ESTIMATE_STEPS[0].id);
  const [customerTab, setCustomerTab] = useState<'existing' | 'new'>('existing');
  
  const form = useForm<EstimateFormValues>({
    resolver: zodResolver(estimateFormSchema),
    defaultValues: {
      project: '',
      customer: '',
      description: '',
      isNewCustomer: false,
      items: [{ description: '', cost: '', markup_percentage: '30', quantity: '1' }],
      contingency_percentage: '10',
      estimate_documents: [],
      ...initialValues
    },
  });
  
  const resetForm = useCallback(() => {
    form.reset({
      project: '',
      customer: '',
      description: '',
      isNewCustomer: false,
      items: [{ description: '', cost: '', markup_percentage: '30', quantity: '1' }],
      contingency_percentage: '10',
      estimate_documents: [],
      ...initialValues
    });
    setCurrentStep(ESTIMATE_STEPS[0].id);
    setCustomerTab('existing');
  }, [form, initialValues]);
  
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);
  
  const handleNewCustomer = () => {
    setCustomerTab('new');
    form.setValue('isNewCustomer', true);
    form.setValue('customer', '');
  };
  
  const handleExistingCustomer = () => {
    setCustomerTab('existing');
    form.setValue('isNewCustomer', false);
    // Clear the nested newCustomer fields instead of using top-level fields
    form.setValue('newCustomer.name', '');
    form.setValue('newCustomer.email', '');
    form.setValue('newCustomer.address', '');
    form.setValue('newCustomer.phone', '');
  };
  
  const validateCurrentStep = async () => {
    let fieldsToValidate: string[] = [];
    
    switch (currentStep) {
      case 'basic-info':
        fieldsToValidate = ['project', customerTab === 'existing' ? 'customer' : 'newCustomer.name'];
        break;
      case 'line-items':
        fieldsToValidate = ['items'];
        break;
      case 'summary':
        fieldsToValidate = ['contingency_percentage'];
        break;
      case 'review':
        fieldsToValidate = [];
        break;
      default:
        fieldsToValidate = [];
    }
    
    const result = await form.trigger(fieldsToValidate as any);
    return result;
  };
  
  const isFirstStep = currentStep === ESTIMATE_STEPS[0].id;
  const isLastStep = currentStep === ESTIMATE_STEPS[ESTIMATE_STEPS.length - 1].id;
  
  return {
    form,
    currentStep,
    setCurrentStep,
    customerTab,
    resetForm,
    handleNewCustomer,
    handleExistingCustomer,
    validateCurrentStep,
    isFirstStep,
    isLastStep
  };
};
