
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Import custom components and utilities
import { useEstimateSubmit } from './hooks/useEstimateSubmit';
import { estimateFormSchema, type EstimateFormValues } from './schemas/estimateFormSchema';
import EstimateStepTabs from './components/form-steps/EstimateStepTabs';
import EstimateStepContent from './components/form-steps/EstimateStepContent';
import { ESTIMATE_STEPS } from './components/form-steps/EstimateStepConstants';
import FormActions from './components/form-steps/FormActions';
import { useEstimateFormData } from './hooks/useEstimateFormData';

interface EstimateMultiStepFormProps {
  open: boolean;
  onClose: () => void;
}

const EstimateMultiStepForm = ({ open, onClose }: EstimateMultiStepFormProps) => {
  const [currentStep, setCurrentStep] = useState(ESTIMATE_STEPS[0].id);
  const [customerTab, setCustomerTab] = useState<'existing' | 'new'>('existing');
  const { isSubmitting, submitEstimate } = useEstimateSubmit();
  const { 
    customers, 
    loading: dataLoading, 
    selectedCustomerAddress,
    selectedCustomerName,
  } = useEstimateFormData({ open, customerId: "" });

  // Initialize the form
  const form = useForm<EstimateFormValues>({
    resolver: zodResolver(estimateFormSchema),
    defaultValues: {
      project: '',
      customer: '',
      description: '',
      contingency_percentage: '0',
      location: {
        address: '',
        city: '',
        state: '',
        zip: '',
      },
      items: [{ description: '', quantity: '1', unitPrice: '0', cost: '0', markup_percentage: '0' }],
      showSiteLocation: false,
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
    },
  });

  // Watch for form value changes
  const isNewCustomer = form.watch('isNewCustomer');

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setCurrentStep(ESTIMATE_STEPS[0].id);
      form.reset({
        project: '',
        customer: '',
        description: '',
        contingency_percentage: '0',
        location: {
          address: '',
          city: '',
          state: '',
          zip: '',
        },
        items: [{ description: '', quantity: '1', unitPrice: '0', cost: '0', markup_percentage: '0' }],
        showSiteLocation: false,
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
      });
    }
  }, [open, form]);

  // Handle form submission
  const onSubmit = async (data: EstimateFormValues) => {
    await submitEstimate(data, customers, onClose);
  };

  const handleNewCustomer = () => {
    form.setValue('isNewCustomer', true);
    form.setValue('customer', '');
    setCustomerTab('new');
  };

  const handleExistingCustomer = () => {
    form.setValue('isNewCustomer', false);
    setCustomerTab('existing');
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

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 'basic-info':
        return form.trigger(['project', 'customer', 'description']);
      case 'line-items':
        return form.trigger(['items']);
      case 'documents':
        return Promise.resolve(true); // Documents are optional
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

  const isLastStep = currentStep === ESTIMATE_STEPS[ESTIMATE_STEPS.length - 1].id;
  const isFirstStep = currentStep === ESTIMATE_STEPS[0].id;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-2xl font-semibold text-[#0485ea] flex items-center">
            Create New Estimate
            {!isFirstStep && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={goToPreviousStep} 
                className="ml-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4">
          <EstimateStepTabs 
            steps={ESTIMATE_STEPS} 
            currentStep={currentStep} 
            setCurrentStep={setCurrentStep} 
          />
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
      </DialogContent>
    </Dialog>
  );
};

export default EstimateMultiStepForm;
