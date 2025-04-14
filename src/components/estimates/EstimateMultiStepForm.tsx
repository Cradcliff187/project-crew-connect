import { useEffect, useCallback, memo, useMemo } from 'react';
import { Form } from '@/components/ui/form';
import { Dialog } from '@/components/ui/dialog';
import CustomDialogContent from './components/form-steps/DialogContent';

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

const EstimateMultiStepForm = ({ open, onClose }: EstimateMultiStepFormProps) => {
  const { isSubmitting, submitEstimate } = useEstimateSubmit();

  // Create a stable customerId value
  const stableCustomerId = useMemo(() => '', []);

  const {
    customers,
    loading: dataLoading,
    selectedCustomerAddress,
    selectedCustomerName,
  } = useEstimateFormData({ open, customerId: stableCustomerId });

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

  // Determine the selected customer ID - use memo to stabilize
  const selectedCustomerId = useMemo(() => form.watch('customer') || null, [form]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      // Generate a new temporary ID when form opens
      const newTempId = 'temp-' + Math.random().toString(36).substr(2, 9);
      form.setValue('temp_id', newTempId);
    }
  }, [open, form]);

  // Handle form submission - use callback
  const onSubmit = useCallback(
    async (data: any) => {
      await submitEstimate(data, customers, onClose);
    },
    [submitEstimate, customers, onClose]
  );

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
    (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (isLastStep) {
        form.handleSubmit(onSubmit)(e as any);
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
        onClose();
      }
    },
    [onClose]
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
    ]
  );

  const actionsContent = useMemo(
    () => (
      <MemoizedFormActions
        onCancel={onClose}
        onPrevious={isFirstStep ? undefined : goToPreviousStep}
        onNext={isLastStep ? undefined : handleNext}
        isLastStep={isLastStep}
        currentStep={currentStep}
        onSubmit={isLastStep ? handleFinalSubmit : undefined}
        isSubmitting={isSubmitting}
      />
    ),
    [
      onClose,
      isFirstStep,
      goToPreviousStep,
      isLastStep,
      handleNext,
      currentStep,
      handleFinalSubmit,
      isSubmitting,
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
        <div className="flex-1 overflow-y-auto px-6">{formContent}</div>

        <div className="px-6 pb-6">{actionsContent}</div>
      </MemoizedDialogContent>
    ),
    [currentStep, isFirstStep, goToPreviousStep, setCurrentStep, formContent, actionsContent]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {dialogContent}
    </Dialog>
  );
};

export default EstimateMultiStepForm;
