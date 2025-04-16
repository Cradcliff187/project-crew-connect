import { useEffect, useCallback, memo, useMemo, useState } from 'react';
import { Form } from '@/components/ui/form';
import { Dialog } from '@/components/ui/dialog';
import CustomDialogContent from './components/form-steps/DialogContent';
import { Button } from '@/components/ui/button';
import { ChevronLeft, X } from 'lucide-react';

// Import custom components and utilities
import { useEstimateSubmit } from './hooks/useEstimateSubmit';
import { ESTIMATE_STEPS } from './components/form-steps/EstimateStepConstants';
import EstimateStepContent from './components/form-steps/EstimateStepContent';
import FormActions from './components/form-steps/FormActions';
import { useEstimateFormData } from './hooks/useEstimateFormData';
import { useEstimateForm } from '@/hooks/useEstimateForm';

interface EstimateMultiStepFormProps {
  open: boolean;
  onClose: () => void;
}

// Use memo to prevent unnecessary re-renders of child components
const MemoizedEstimateStepContent = memo(EstimateStepContent);
const MemoizedFormActions = memo(FormActions);
const MemoizedDialogContent = memo(CustomDialogContent);

// Generate a unique ID with a timestamp prefix for better uniqueness
const generateUniqueId = () => {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substr(2, 9);
  return `temp-${timestamp}-${randomPart}`;
};

// Get a persistent temporary ID from storage or create a new one
const getOrCreateTempId = () => {
  try {
    const storedId = sessionStorage.getItem('current_estimate_temp_id');
    if (storedId) {
      console.log('[TempID] Found existing temp ID in storage:', storedId);
      return storedId;
    }

    const newId = generateUniqueId();
    console.log('[TempID] Generated new temp ID:', newId);
    sessionStorage.setItem('current_estimate_temp_id', newId);
    return newId;
  } catch (error) {
    // If sessionStorage is not available, generate a new ID each time
    console.warn('[TempID] Session storage not available, using temporary ID');
    return generateUniqueId();
  }
};

const EstimateMultiStepForm = ({ open, onClose }: EstimateMultiStepFormProps) => {
  const { isSubmitting, submitEstimate } = useEstimateSubmit();
  const {
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
  } = useEstimateForm({ open, onClose });

  // Create a stable customerId value
  const stableCustomerId = useMemo(() => '', []);

  const {
    customers,
    loading: dataLoading,
    selectedCustomerAddress,
    selectedCustomerName,
  } = useEstimateFormData({ open, customerId: stableCustomerId });

  // Determine the selected customer ID - use memo to stabilize
  const selectedCustomerId = useMemo(() => form.watch('customer') || null, [form]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      // Get existing temp ID or create a new one if it doesn't exist
      const tempId = getOrCreateTempId();
      console.log('[TempID] Setting form temp_id value to:', tempId);
      form.setValue('temp_id', tempId);

      // Log all existing temp IDs in session storage
      try {
        console.log('[TempID] Current sessionStorage keys:', Object.keys(sessionStorage));
      } catch (e) {
        console.warn('[TempID] Could not access sessionStorage');
      }
    }
  }, [open, form]);

  // Clean up the temp ID after form is submitted successfully
  const handleCleanupTempId = useCallback(() => {
    try {
      const tempId = sessionStorage.getItem('current_estimate_temp_id');
      console.log('[TempID] Cleaning up temp ID after submission:', tempId);
      sessionStorage.removeItem('current_estimate_temp_id');
    } catch (e) {
      console.warn('[TempID] Error cleaning up temp ID:', e);
    }

    onClose();
  }, [onClose]);

  // Handle form submission - use callback
  const onSubmit = useCallback(
    async (data: any) => {
      // Extract status from data if present or default to 'draft'
      const { status = 'draft', ...formData } = data;
      const success = await submitEstimate(formData, customers, status, handleCleanupTempId);
    },
    [submitEstimate, customers, handleCleanupTempId]
  );

  // Handle close by user (without submitting)
  const handleClose = useCallback(() => {
    // When user cancels without submitting, we keep the temp ID in storage
    // for potential continuation later
    onClose();
  }, [onClose]);

  const goToNextStep = useCallback(() => {
    const currentIndex = ESTIMATE_STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex < ESTIMATE_STEPS.length - 1) {
      setCurrentStep(ESTIMATE_STEPS[currentIndex + 1].id);
    }
  }, [currentStep, setCurrentStep]);

  const goToPreviousStep = useCallback(() => {
    const currentIndex = ESTIMATE_STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(ESTIMATE_STEPS[currentIndex - 1].id);
    }
  }, [currentStep, setCurrentStep]);

  const handleNext = useCallback(
    async (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      const isValid = await validateCurrentStep();
      if (isValid) {
        goToNextStep();
      }
    },
    [validateCurrentStep, goToNextStep]
  );

  // Handle the final submit
  const handleFinalSubmit = useCallback(
    (e?: React.FormEvent, status?: string) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (isLastStep) {
        // Pass the status to the onSubmit function or use 'draft' as default
        const finalStatus = status || 'draft';
        const formData = form.getValues();
        onSubmit({ ...formData, status: finalStatus });
      }
    },
    [isLastStep, form, onSubmit]
  );

  // Optimize form submission
  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (isLastStep) {
        form.handleSubmit(onSubmit)(e);
      }
    },
    [isLastStep, form, onSubmit]
  );

  // Optimize dialog open change
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        handleClose();
      }
    },
    [handleClose]
  );

  // Memoize content to reduce renders
  const formContent = useMemo(
    () => (
      <Form {...form}>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <MemoizedEstimateStepContent
            currentStep={currentStep}
            customerTab={customerTab}
            onNewCustomer={handleNewCustomer}
            onExistingCustomer={handleExistingCustomer}
            selectedCustomerAddress={selectedCustomerAddress}
            selectedCustomerName={selectedCustomerName}
            selectedCustomerId={selectedCustomerId}
            customers={customers}
            loading={dataLoading}
            onSubmit={isLastStep ? status => handleFinalSubmit(undefined, status) : undefined}
          />
        </form>
      </Form>
    ),
    [
      form,
      handleFormSubmit,
      currentStep,
      customerTab,
      handleNewCustomer,
      handleExistingCustomer,
      selectedCustomerAddress,
      selectedCustomerName,
      selectedCustomerId,
      customers,
      dataLoading,
      isLastStep,
      handleFinalSubmit,
    ]
  );

  const dialogContent = useMemo(
    () => (
      <MemoizedDialogContent
        currentStep={currentStep}
        isFirstStep={isFirstStep}
        onPreviousStep={goToPreviousStep}
        steps={ESTIMATE_STEPS}
        setCurrentStep={setCurrentStep}
      >
        {!isLastStep ? (
          // Regular steps - use standard layout
          <div className="flex flex-col min-h-[60vh] max-h-[calc(85vh-120px)] overflow-visible">
            <div className="flex-1 overflow-y-auto">{formContent}</div>
            <div className="sticky bottom-0 bg-white border-t pt-2 z-10">
              <MemoizedFormActions
                onCancel={handleClose}
                onPrevious={isFirstStep ? undefined : goToPreviousStep}
                onNext={handleNext}
                isLastStep={false}
                currentStep={currentStep}
                onSubmit={undefined}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        ) : (
          // Review step - with scrolling
          <div className="flex flex-col min-h-[70vh] overflow-visible">
            <div className="overflow-y-auto h-full">{formContent}</div>
            <div className="sticky bottom-0 w-full py-2 bg-white border-t z-50 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousStep}
                disabled={isSubmitting}
                size="sm"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                size="sm"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </MemoizedDialogContent>
    ),
    [
      currentStep,
      isFirstStep,
      goToPreviousStep,
      setCurrentStep,
      formContent,
      isLastStep,
      handleClose,
      handleNext,
      handleFinalSubmit,
      isSubmitting,
    ]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {dialogContent}
    </Dialog>
  );
};

export default EstimateMultiStepForm;
