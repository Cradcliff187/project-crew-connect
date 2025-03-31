
import { useEffect, useRef } from 'react';
import { Form } from '@/components/ui/form';
import { Dialog } from '@/components/ui/dialog';
import CustomDialogContent from './components/form-steps/DialogContent';

// Import custom components and utilities
import { useEstimateSubmit } from './hooks/useEstimateSubmit';
import { ESTIMATE_STEPS } from './components/form-steps/EstimateStepConstants';
import EstimateStepContent from './components/form-steps/EstimateStepContent';
import FormActions from './components/form-steps/FormActions';
import { useEstimateFormData } from './hooks/useEstimateFormData';
import { useEstimateForm } from './hooks/useEstimateForm';
import { ensureStorageBucket } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface EstimateMultiStepFormProps {
  open: boolean;
  onClose: () => void;
}

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

  // Use a ref to track initialization state and prevent redundant calls
  const initialized = useRef(false);
  const storageChecked = useRef(false);

  // Generate a temp ID only once when dialog opens
  useEffect(() => {
    if (open && !initialized.current) {
      initialized.current = true;
      
      // First check if we already have a temp ID
      const existingTempId = form.getValues('temp_id');
      
      if (!existingTempId) {
        // Generate a new temporary ID when form opens and there isn't one
        const newTempId = "temp-" + Math.random().toString(36).substring(2, 9);
        form.setValue('temp_id', newTempId);
        console.log('Generated new temp ID for estimate:', newTempId);
      } else {
        console.log('Using existing temp ID for estimate:', existingTempId);
      }
      
      // Ensure the storage bucket exists when creating a new estimate - but only once
      if (!storageChecked.current) {
        storageChecked.current = true;
        ensureStorageBucket().then(result => {
          if (result.success) {
            console.log('Storage bucket verified for document uploads');
          } else {
            console.warn('Storage bucket check failed:', result.error);
            toast({
              title: 'Document Storage Warning',
              description: 'Document uploads may not work due to storage configuration issues',
              variant: 'destructive',
            });
          }
        }).catch(error => {
          console.error('Failed to verify storage bucket:', error);
        });
      }
    } else if (!open) {
      resetForm();
      initialized.current = false;
    }
  }, [open, form, resetForm]);

  // Handle form submission
  const onSubmit = async (data: any) => {
    await submitEstimate(data, customers, onClose);
  };

  const goToNextStep = () => {
    const currentIndex = ESTIMATE_STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex < ESTIMATE_STEPS.length - 1) {
      setCurrentStep(ESTIMATE_STEPS[currentIndex + 1].id);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = ESTIMATE_STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(ESTIMATE_STEPS[currentIndex - 1].id);
    }
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      goToNextStep();
    }
  };

  // Generate a stable dialog ID for accessibility
  const dialogDescriptionId = "estimate-form-description";

  return (
    <Dialog 
      open={open} 
      onOpenChange={(open) => !open && onClose()}
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
              onSubmit={form.handleSubmit(onSubmit)} 
              className="space-y-6"
              aria-describedby={dialogDescriptionId}
            >
              <p id={dialogDescriptionId} className="sr-only">
                Form to create a new estimate with multiple steps
              </p>
              <EstimateStepContent 
                currentStep={currentStep}
                customerTab={customerTab}
                onNewCustomer={handleNewCustomer}
                onExistingCustomer={handleExistingCustomer}
                selectedCustomerAddress={selectedCustomerAddress}
                selectedCustomerName={selectedCustomerName}
                customers={customers}
                loading={dataLoading}
              />
            </form>
          </Form>
        </div>

        <div className="px-6 pb-6">
          <FormActions 
            onCancel={onClose}
            onPrevious={isFirstStep ? undefined : goToPreviousStep}
            onNext={isLastStep ? undefined : handleNext}
            isLastStep={isLastStep}
            currentStep={currentStep}
            onSubmit={isLastStep ? form.handleSubmit(onSubmit) : undefined}
            isSubmitting={isSubmitting}
          />
        </div>
      </CustomDialogContent>
    </Dialog>
  );
};

export default EstimateMultiStepForm;
