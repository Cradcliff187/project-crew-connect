
import { useState, useEffect } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import BasicInfoStep from './BasicInfoStep';
import EstimateItemFields from '../EstimateItemFields';
import EstimateSummary from '../EstimateSummary';
import EstimateStepTabs from './EstimateStepTabs';
import FormActions from './FormActions';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import { toast } from "@/hooks/use-toast";

interface EditFormContentProps {
  customers: { id: string; name: string; address?: string; city?: string; state?: string; zip?: string; }[];
  selectedCustomerAddress: string | null;
  selectedCustomerName: string | null;
  customerTab: 'existing' | 'new';
  onNewCustomer: () => void;
  onExistingCustomer: () => void;
  onPreview: () => void;
  onCancel: () => void;
}

export const ESTIMATE_STEPS = [
  { id: 'basic-info', label: 'Basic Info' },
  { id: 'items', label: 'Line Items' },
  { id: 'summary', label: 'Summary' },
  { id: 'preview', label: 'Preview' }
];

const EditFormContent = ({
  customers,
  selectedCustomerAddress,
  selectedCustomerName,
  customerTab,
  onNewCustomer,
  onExistingCustomer,
  onPreview,
  onCancel
}: EditFormContentProps) => {
  const form = useFormContext<EstimateFormValues>();
  const isNewCustomer = form.watch('isNewCustomer');
  const showSiteLocation = form.watch('showSiteLocation');
  const selectedCustomer = form.watch('customer');
  
  const [currentStep, setCurrentStep] = useState(ESTIMATE_STEPS[0].id);

  // Modified to ensure we're not causing unnecessary re-renders or DOM manipulations
  useEffect(() => {
    if (selectedCustomer || isNewCustomer) {
      // Only reset when it makes logical sense
      form.setValue('showSiteLocation', false, { shouldValidate: false });
    }
  }, [selectedCustomer, isNewCustomer, form]);

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

  const validateCurrentStep = async () => {
    switch (currentStep) {
      case 'basic-info':
        const isBasicInfoValid = await form.trigger(['project']);
        
        // Check if customer is valid based on the customer type
        let isCustomerValid = true;
        if (isNewCustomer) {
          isCustomerValid = await form.trigger(['newCustomer.name']);
          if (!isCustomerValid) {
            toast({
              title: "Customer name required",
              description: "Please provide a name for the new customer",
              variant: "destructive"
            });
          }
        } else {
          isCustomerValid = await form.trigger(['customer']);
          if (!isCustomerValid) {
            toast({
              title: "Customer selection required",
              description: "Please select a customer for this estimate",
              variant: "destructive"
            });
          }
        }
        
        return isBasicInfoValid && isCustomerValid;
        
      case 'items':
        const isItemsValid = await form.trigger('items');
        if (!isItemsValid) {
          toast({
            title: "Line items validation failed",
            description: "Please check that all line items have descriptions and costs",
            variant: "destructive"
          });
        }
        return isItemsValid;
        
      case 'summary':
        return form.trigger(['contingency_percentage']);
        
      default:
        return Promise.resolve(true);
    }
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      if (currentStep === 'summary') {
        onPreview();
      } else {
        goToNextStep();
      }
    }
  };

  const isLastStep = currentStep === ESTIMATE_STEPS[ESTIMATE_STEPS.length - 2].id;

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <EstimateStepTabs 
          steps={ESTIMATE_STEPS} 
          currentStep={currentStep} 
          setCurrentStep={setCurrentStep} 
        />
      </div>

      <Tabs value={currentStep} className="flex-grow">
        <TabsContent value="basic-info" className="mt-0">
          <BasicInfoStep 
            customers={customers}
            selectedCustomerAddress={selectedCustomerAddress}
            selectedCustomerName={selectedCustomerName}
            onNewCustomer={onNewCustomer}
            onExistingCustomer={onExistingCustomer}
            customerTab={customerTab}
            isNewCustomer={isNewCustomer}
            showSiteLocation={showSiteLocation}
          />
        </TabsContent>

        <TabsContent value="items" className="mt-0">
          <EstimateItemFields />
        </TabsContent>

        <TabsContent value="summary" className="mt-0">
          <EstimateSummary />
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <FormActions 
          onCancel={onCancel} 
          onPrevious={goToPreviousStep}
          onNext={handleNext}
          isLastStep={isLastStep}
          currentStep={currentStep}
          isPreviewStep={false}
        />
      </div>
    </div>
  );
};

export default EditFormContent;
