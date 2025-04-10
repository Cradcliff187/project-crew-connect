
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import useWorkOrderForm from './useWorkOrderForm';
import { 
  WorkOrderStepTabs, 
  WorkOrderDialogFooter, 
  WorkOrderLoadingState, 
  WorkOrderStepContent,
  WORK_ORDER_STEPS
} from './components';

interface WorkOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWorkOrderAdded: () => void;
}

const WorkOrderMultiStepDialog = ({
  open,
  onOpenChange,
  onWorkOrderAdded
}: WorkOrderDialogProps) => {
  const [currentStep, setCurrentStep] = useState(WORK_ORDER_STEPS[0].id);
  
  const { 
    form, 
    isSubmitting, 
    formData, 
    useCustomAddress, 
    dataLoaded,
    isLoading,
    onSubmit
  } = useWorkOrderForm({ 
    onOpenChange, 
    onWorkOrderAdded,
    isOpen: open
  });

  // This function is now only used when the "Save Work Order" button is clicked
  const handleFormSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  const goToNextStep = () => {
    const currentIndex = WORK_ORDER_STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex < WORK_ORDER_STEPS.length - 1) {
      setCurrentStep(WORK_ORDER_STEPS[currentIndex + 1].id);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = WORK_ORDER_STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(WORK_ORDER_STEPS[currentIndex - 1].id);
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 'basic-info':
        return form.trigger(['title', 'work_order_number', 'description', 'priority', 'po_number']);
      case 'schedule':
        return form.trigger(['time_estimate', 'scheduled_date', 'due_by_date']);
      case 'location':
        if (useCustomAddress) {
          return form.trigger(['address', 'city', 'state', 'zip']);
        }
        return form.trigger(['customer_id', 'location_id']);
      default:
        return Promise.resolve(true);
    }
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      goToNextStep();
    }
  };

  // Reset to first step when dialog opens
  if (!open && currentStep !== WORK_ORDER_STEPS[0].id) {
    setCurrentStep(WORK_ORDER_STEPS[0].id);
  }

  const isLastStep = currentStep === WORK_ORDER_STEPS[WORK_ORDER_STEPS.length - 1].id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] md:max-w-[700px] max-h-[90vh] flex flex-col overflow-hidden bg-white shadow-lg border-2 border-gray-100">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold text-[#0485ea]">
            Create New Work Order
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-2 mb-6">
          <WorkOrderStepTabs 
            currentStep={currentStep} 
            setCurrentStep={setCurrentStep} 
            isDisabled={isLoading || isSubmitting} 
          />
        </div>

        <div className="overflow-y-auto flex-grow pr-2 -mr-2 py-4">
          {isLoading ? (
            <WorkOrderLoadingState />
          ) : (
            <Form {...form}>
              {/* The form no longer has the onSubmit handler directly - this prevents automatic submission */}
              <form id="work-order-form" className="space-y-6">
                <WorkOrderStepContent
                  currentStep={currentStep}
                  form={form}
                  useCustomAddress={useCustomAddress}
                  formData={formData}
                  dataLoaded={dataLoaded}
                  setCurrentStep={setCurrentStep}
                />
              </form>
            </Form>
          )}
        </div>
        
        <WorkOrderDialogFooter
          currentStep={currentStep}
          isSubmitting={isSubmitting}
          isLoading={isLoading}
          dataLoaded={dataLoaded}
          onPrevious={goToPreviousStep}
          onNext={handleNext}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleFormSubmit} // Pass the submit handler to the footer
        />
      </DialogContent>
    </Dialog>
  );
};

export default WorkOrderMultiStepDialog;
