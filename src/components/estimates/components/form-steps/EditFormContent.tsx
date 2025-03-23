
import { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import BasicInfoStep from './BasicInfoStep';
import LocationFields from '../LocationFields';
import EstimateItemFields from '../EstimateItemFields';
import EstimateSummary from '../EstimateSummary';
import EstimateStepTabs from './EstimateStepTabs';
import FormActions from './FormActions';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';

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
  
  const [currentStep, setCurrentStep] = useState(ESTIMATE_STEPS[0].id);

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
        return form.trigger(['project', 'customer']);
      case 'items':
        return form.trigger('items');
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
          
          {(showSiteLocation || isNewCustomer || !selectedCustomerAddress) && (
            <LocationFields />
          )}
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
