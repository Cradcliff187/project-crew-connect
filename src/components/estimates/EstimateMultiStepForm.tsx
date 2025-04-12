
import { useEffect, useCallback, memo } from 'react';
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

const EstimateMultiStepForm = ({ open, onClose }: EstimateMultiStepFormProps) => {
  const { isSubmitting, submitEstimate } = useEstimateSubmit();
  const { 
    customers, 
    loading: dataLoading, 
    selectedCustomerAddress,
    selectedCustomerName,
  } = useEstimateFormData({ open, customerId: "" });

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
    isLastStep
  } = useEstimateForm({ open, onClose });

  // Determine the selected customer ID from the form values
  const selectedCustomerId = form.watch('customer') || null;

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      // Generate a new temporary ID when form opens
      const newTempId = "temp-" + Math.random().toString(36).substr(2, 9);
      form.setValue('temp_id', newTempId);
    } else {
      resetForm();
    }
  }, [open, form, resetForm]);

  // Handle form submission - use useCallback to prevent recreation on each render
  const onSubmit = useCallback(async (data: any) => {
    await submitEstimate(data, customers, onClose);
  }, [submitEstimate, customers, onClose]);

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

  const handleNext = useCallback(async (e?: React.MouseEvent) => {
    // Prevent event propagation to avoid form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const isValid = await validateCurrentStep();
    if (isValid) {
      goToNextStep();
    }
  }, [validateCurrentStep, goToNextStep]);

  // Handle the final submit with proper type
  const handleFinalSubmit = useCallback((e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (isLastStep) {
      form.handleSubmit(onSubmit)(e as any);
    }
  }, [isLastStep, form, onSubmit]);

  // Optimize form submission handling
  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLastStep) {
      form.handleSubmit(onSubmit)(e);
    }
  }, [isLastStep, form, onSubmit]);

  // Optimize dialog open change handling
  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      onClose();
    }
  }, [onClose]);

  return (
    <Dialog 
      open={open} 
      onOpenChange={handleOpenChange}
    >
      <CustomDialogContent 
        currentStep={currentStep}
        isFirstStep={isFirstStep}
        onPreviousStep={goToPreviousStep}
        steps={ESTIMATE_STEPS}
        setCurrentStep={setCurrentStep}
      >
        <div className="flex-1 overflow-y-auto px-6">
          <Form {...form}>
            <form 
              onSubmit={handleFormSubmit} 
              className="space-y-6"
            >
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
        </div>

        <div className="px-6 pb-6">
          <MemoizedFormActions 
            onCancel={onClose}
            onPrevious={isFirstStep ? undefined : goToPreviousStep}
            onNext={isLastStep ? undefined : handleNext}
            isLastStep={isLastStep}
            currentStep={currentStep}
            onSubmit={isLastStep ? handleFinalSubmit : undefined}
            isSubmitting={isSubmitting}
          />
        </div>
      </CustomDialogContent>
    </Dialog>
  );
};

export default EstimateMultiStepForm;
