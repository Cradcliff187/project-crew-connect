import { useState, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EstimateFormValues } from '../schemas/estimateFormSchema';
import { toast } from '@/hooks/use-toast';

interface ValidationResponse {
  isValid: boolean;
  errors: Record<string, string[]>;
}

export const useEstimateFormValidation = (form: UseFormReturn<EstimateFormValues>) => {
  const [isValidating, setIsValidating] = useState(false);

  const validateEstimateForm = useCallback(async (): Promise<ValidationResponse> => {
    setIsValidating(true);

    try {
      // Trigger validation on all fields
      const validationResult = await form.trigger();

      if (!validationResult) {
        // Extract and format errors for better feedback
        const errors = form.formState.errors;
        const formattedErrors: Record<string, string[]> = {};

        // Process basic field errors
        ['project', 'customer', 'description', 'contingency_percentage'].forEach(field => {
          const error = errors[field as keyof typeof errors];
          if (error && error.message) {
            formattedErrors[field] = [error.message as string];
          }
        });

        // Process items errors
        const itemsError = errors.items;
        if (itemsError && Array.isArray(itemsError)) {
          formattedErrors.items = [];

          itemsError.forEach((item, index) => {
            if (item && typeof item === 'object') {
              Object.entries(item).forEach(([field, error]) => {
                if (error && typeof error === 'object' && 'message' in error) {
                  formattedErrors.items.push(`Item ${index + 1}: ${field} - ${error.message}`);
                }
              });
            }
          });
        }

        // Customized validation error feedback
        toast({
          title: 'Validation Failed',
          description: 'Please correct the highlighted fields',
          variant: 'destructive',
        });

        return { isValid: false, errors: formattedErrors };
      }

      return { isValid: true, errors: {} };
    } finally {
      setIsValidating(false);
    }
  }, [form]);

  const validateStep = useCallback(
    async (step: string): Promise<boolean> => {
      setIsValidating(true);

      try {
        let fieldsToValidate: string[] = [];

        switch (step) {
          case 'basic-info':
            fieldsToValidate = ['project', 'customer', 'description'];
            break;
          case 'line-items':
            fieldsToValidate = ['items', 'contingency_percentage'];
            break;
          case 'summary':
            // No specific validation for summary step
            return true;
          default:
            // Default to validating the entire form
            return (await validateEstimateForm()).isValid;
        }

        const result = await form.trigger(fieldsToValidate as any);

        if (!result) {
          toast({
            title: 'Please check the form',
            description: 'Some required information is missing',
            variant: 'destructive',
          });
        }

        return result;
      } finally {
        setIsValidating(false);
      }
    },
    [form, validateEstimateForm]
  );

  return {
    validateEstimateForm,
    validateStep,
    isValidating,
  };
};

export default useEstimateFormValidation;
