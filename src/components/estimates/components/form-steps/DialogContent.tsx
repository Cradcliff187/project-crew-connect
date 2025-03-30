
import React from 'react';
import { DialogContent as ShadcnDialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import StepNavigation from './StepNavigation';
import EstimateStepTabs from './EstimateStepTabs';
import { EstimateStep } from './EstimateStepConstants';

interface DialogContentProps {
  children: React.ReactNode;
  currentStep: string;
  isFirstStep: boolean;
  onPreviousStep: () => void;
  steps: EstimateStep[];
  setCurrentStep: (step: string) => void;
}

const DialogContent = ({
  children,
  currentStep,
  isFirstStep,
  onPreviousStep,
  steps,
  setCurrentStep
}: DialogContentProps) => {
  const currentStepObj = steps.find(step => step.id === currentStep);
  
  return (
    <ShadcnDialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
      <DialogHeader className="px-6 pt-6 pb-2">
        <DialogTitle className="text-2xl font-semibold text-[#0485ea] flex items-center">
          Create New Estimate
          <StepNavigation 
            isFirstStep={isFirstStep}
            onPrevious={onPreviousStep}
            currentStep={currentStep}
          />
        </DialogTitle>
        <DialogDescription>
          {currentStepObj ? 
            currentStepObj.description || `Step ${currentStepObj.order} of ${steps.length}` : 
            'Fill out the form to create a new estimate'}
        </DialogDescription>
      </DialogHeader>

      <div className="px-6 py-4">
        <EstimateStepTabs 
          steps={steps} 
          currentStep={currentStep} 
          setCurrentStep={setCurrentStep} 
        />
      </div>

      {children}
    </ShadcnDialogContent>
  );
};

export default DialogContent;
