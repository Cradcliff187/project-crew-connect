
import { useState } from 'react';
import { SaveIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WorkOrderBasicInfoFields from './WorkOrderBasicInfoFields';
import WorkOrderScheduleFields from './WorkOrderScheduleFields';
import WorkOrderLocationFields from './WorkOrderLocationFields';
import WorkOrderSummary from './WorkOrderSummary';
import useWorkOrderForm from './useWorkOrderForm';
import { Loader2 } from 'lucide-react';

const STEPS = [
  { id: 'basic-info', label: 'Basic Info' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'location', label: 'Location' },
  { id: 'preview', label: 'Preview' }
];

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
  const [currentStep, setCurrentStep] = useState('basic-info');
  
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

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  const goToNextStep = () => {
    const currentIndex = STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].id);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id);
    }
  };

  const isFirstStep = currentStep === STEPS[0].id;
  const isLastStep = currentStep === STEPS[STEPS.length - 1].id;

  // Reset to first step when dialog opens
  if (!open && currentStep !== STEPS[0].id) {
    setCurrentStep(STEPS[0].id);
  }

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col overflow-hidden bg-white">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold text-[#0485ea]">
            Create New Work Order
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-2 mb-6">
          <TabsList className="grid grid-cols-4 w-full">
            {STEPS.map((step) => (
              <TabsTrigger
                key={step.id}
                value={step.id}
                disabled={isLoading || isSubmitting}
                className={currentStep === step.id ? 'bg-[#0485ea] text-white' : ''}
                onClick={() => setCurrentStep(step.id)}
              >
                {step.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="overflow-y-auto flex-grow pr-1 -mr-1 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-[#0485ea]" />
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          ) : (
            <Form {...form}>
              <form id="work-order-form" onSubmit={handleSubmit} className="space-y-6">
                <Tabs value={currentStep} onValueChange={setCurrentStep}>
                  <TabsContent value="basic-info" className="mt-0">
                    <WorkOrderBasicInfoFields form={form} />
                  </TabsContent>
                  
                  <TabsContent value="schedule" className="mt-0">
                    <WorkOrderScheduleFields form={form} />
                  </TabsContent>
                  
                  {dataLoaded && (
                    <TabsContent value="location" className="mt-0">
                      <WorkOrderLocationFields 
                        form={form} 
                        useCustomAddress={useCustomAddress}
                        customers={formData.customers}
                        locations={formData.locations}
                        employees={formData.employees}
                      />
                    </TabsContent>
                  )}

                  <TabsContent value="preview" className="mt-0">
                    <WorkOrderSummary form={form} />
                  </TabsContent>
                </Tabs>
              </form>
            </Form>
          )}
        </div>
        
        <DialogFooter className="border-t pt-4 mt-auto flex justify-between">
          <div>
            {!isFirstStep && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={goToPreviousStep}
                disabled={isSubmitting || isLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            
            {!isLastStep ? (
              <Button 
                type="button" 
                onClick={handleNext}
                disabled={isLoading || !dataLoaded}
                className="bg-[#0485ea] text-white hover:bg-[#0373d1]"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                form="work-order-form"
                type="submit" 
                disabled={isSubmitting || isLoading || !dataLoaded}
                className="bg-[#0485ea] text-white hover:bg-[#0373d1]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <SaveIcon className="h-4 w-4 mr-2" />
                    Save Work Order
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WorkOrderMultiStepDialog;
