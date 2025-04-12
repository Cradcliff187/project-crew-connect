
import React, { memo } from 'react';
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

// Memoized components to prevent unnecessary rerenders
const MemoizedStepNavigation = memo(StepNavigation);
const MemoizedEstimateStepTabs = memo(EstimateStepTabs);

const DialogContent = ({
  children,
  currentStep,
  isFirstStep,
  onPreviousStep,
  steps,
  setCurrentStep
}: DialogContentProps) => {
  return (
    <ShadcnDialogContent 
      className="max-w-[95vw] md:max-w-[90vw] lg:max-w-[85vw] max-h-[90vh] overflow-hidden p-0 flex flex-col"
      aria-labelledby="estimate-dialog-title"
      aria-describedby="estimate-dialog-description"
      // Prevent event bubbling to improve performance
      onClick={(e) => e.stopPropagation()}
      onPointerDownCapture={(e) => e.stopPropagation()}
    >
      <DialogHeader className="px-6 pt-6 pb-2">
        <DialogTitle id="estimate-dialog-title" className="text-2xl font-semibold text-[#0485ea] flex items-center">
          Create New Estimate
          <MemoizedStepNavigation 
            isFirstStep={isFirstStep}
            onPrevious={onPreviousStep}
            currentStep={currentStep}
          />
        </DialogTitle>
        <DialogDescription id="estimate-dialog-description">
          Create and manage estimates for your customers
        </DialogDescription>
      </DialogHeader>

      <div className="px-6 py-4" role="tablist" aria-label="Estimate creation steps">
        <MemoizedEstimateStepTabs 
          steps={steps} 
          currentStep={currentStep} 
          setCurrentStep={setCurrentStep} 
        />
      </div>

      {children}
    </ShadcnDialogContent>
  );
};

// Export as memoized component to prevent unnecessary rerenders
export default memo(DialogContent);
