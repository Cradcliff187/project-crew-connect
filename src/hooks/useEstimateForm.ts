import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  estimateFormSchema,
  EstimateFormValues,
} from '@/components/estimates/schemas/estimateFormSchema';
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
  const resetRequested = useRef(false);

  const form = useForm<EstimateFormValues>({
    resolver: zodResolver(estimateFormSchema),
    defaultValues: {
      project: '',
      customer: '',
      description: '',
      showSiteLocation: false,
      location: {
        address: '',
        city: '',
        state: '',
        zip: '',
      },
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
      items: [{ description: '', cost: '', markup_percentage: '30', quantity: '1' }],
      contingency_percentage: '10',
      estimate_documents: [],
      ...initialValues,
    },
  });

  const resetForm = useCallback(() => {
    // Set a flag that the reset was requested
    resetRequested.current = true;

    form.reset({
      project: '',
      customer: '',
      description: '',
      showSiteLocation: false,
      location: {
        address: '',
        city: '',
        state: '',
        zip: '',
      },
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
      items: [{ description: '', cost: '', markup_percentage: '30', quantity: '1' }],
      contingency_percentage: '10',
      estimate_documents: [],
      ...initialValues,
    });
    setCurrentStep(ESTIMATE_STEPS[0].id);
    setCustomerTab('existing');
  }, [form, initialValues]);

  // Use a separate effect to handle reset when dialog closes
  useEffect(() => {
    if (!open && resetRequested.current) {
      // Clear the reset request flag
      resetRequested.current = false;
    }
  }, [open]);

  const handleNewCustomer = useCallback(() => {
    setCustomerTab('new');
    form.setValue('isNewCustomer', true);
    form.setValue('customer', '');
  }, [form]);

  const handleExistingCustomer = useCallback(() => {
    setCustomerTab('existing');
    form.setValue('isNewCustomer', false);
    // Clear the nested newCustomer fields instead of using top-level fields
    form.setValue('newCustomer.name', '');
    form.setValue('newCustomer.email', '');
    form.setValue('newCustomer.address', '');
    form.setValue('newCustomer.phone', '');
  }, [form]);

  const validateCurrentStep = useCallback(async () => {
    let fieldsToValidate: string[] = [];

    switch (currentStep) {
      case 'basic-info':
        fieldsToValidate = [
          'project',
          customerTab === 'existing' ? 'customer' : 'newCustomer.name',
        ];
        break;
      case 'line-items':
        // Add the contingency_percentage to the validation for line-items step
        fieldsToValidate = ['items', 'contingency_percentage'];
        break;
      case 'summary':
        // Remove contingency_percentage from summary validation since it's now in line-items step
        fieldsToValidate = [];
        break;
      case 'review':
        fieldsToValidate = [];
        break;
      default:
        fieldsToValidate = [];
    }

    const result = await form.trigger(fieldsToValidate as any);
    return result;
  }, [currentStep, customerTab, form]);

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
    isLastStep,
  };
};
