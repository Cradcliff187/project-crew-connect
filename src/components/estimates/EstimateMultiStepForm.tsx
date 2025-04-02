
import { useEffect } from 'react';
import { Form } from '@/components/ui/form';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// Import custom components and utilities
import { useEstimateSubmit } from './hooks/useEstimateSubmit';
import { ESTIMATE_STEPS } from './components/form-steps/EstimateStepConstants';
import EstimateStepContent from './components/form-steps/EstimateStepContent';
import FormActions from './components/form-steps/FormActions';
import { useEstimateFormData } from './hooks/useEstimateFormData';
import { useEstimateForm } from './hooks/useEstimateForm';

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

  const handleNext = async (e?: React.MouseEvent) => {
    // Prevent event propagation to avoid form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const isValid = await validateCurrentStep();
    if (isValid) {
      goToNextStep();
    }
  };

  // Handle the final submit with proper type
  const handleFinalSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (isLastStep) {
      form.handleSubmit(onSubmit)(e as any);
    }
  };

  // Get current step title for dialog title
  const currentStepTitle = ESTIMATE_STEPS.find(step => step.id === currentStep)?.label || "Create Estimate";
  
  return (
    <Dialog 
      open={open} 
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent 
        className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0" 
        aria-describedby="estimate-form-description"
      >
        {/* Add hidden DialogTitle and DialogDescription for accessibility */}
        <DialogTitle className="sr-only">Create New Estimate - {currentStepTitle}</DialogTitle>
        <DialogDescription id="estimate-form-description" className="sr-only">
          Form for creating a new estimate with multiple steps including basic information, line items, and review.
        </DialogDescription>
        
        <div className="flex flex-col h-full">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#0485ea]">Create New Estimate</h2>
              <p className="text-sm text-muted-foreground">Step: {currentStepTitle}</p>
            </div>
            
            <div className="flex gap-2">
              {ESTIMATE_STEPS.map((step, index) => (
                <div 
                  key={step.id}
                  className={`w-2 h-2 rounded-full ${
                    currentStep === step.id 
                      ? 'bg-[#0485ea]' 
                      : ESTIMATE_STEPS.findIndex(s => s.id === currentStep) > index 
                        ? 'bg-[#0485ea]/50' 
                        : 'bg-gray-200'
                  }`}
                  aria-label={`Step ${index + 1}: ${step.label}`}
                />
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <Form {...form}>
              <form 
                onSubmit={(e) => {
                  // Prevent default submit behavior when not on last step
                  e.preventDefault();
                  e.stopPropagation();
                  
                  if (isLastStep) {
                    form.handleSubmit(onSubmit)(e);
                  }
                }} 
                className="space-y-6"
              >
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

          <div className="px-6 py-4 border-t">
            <FormActions 
              onCancel={onClose}
              onPrevious={isFirstStep ? undefined : goToPreviousStep}
              onNext={isLastStep ? undefined : handleNext}
              isLastStep={isLastStep}
              currentStep={currentStep}
              onSubmit={isLastStep ? handleFinalSubmit : undefined}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EstimateMultiStepForm;
