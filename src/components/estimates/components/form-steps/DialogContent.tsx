import React, { memo } from 'react';
import {
  DialogContent as ShadcnDialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
  setCurrentStep,
}: DialogContentProps) => {
  // Extract the form content and actions from the children
  // to place them correctly within the tabs structure
  const formAndActions = children;

  return (
    <ShadcnDialogContent
      className="max-w-[95vw] md:max-w-[90vw] lg:max-w-[85vw] max-h-[90vh] p-0 flex flex-col"
      onClick={e => e.stopPropagation()}
      onPointerDownCapture={e => e.stopPropagation()}
    >
      <DialogHeader className="px-6 pt-6 pb-2">
        <DialogTitle className="text-2xl font-semibold text-[#0485ea] flex items-center">
          Create New Estimate
          <MemoizedStepNavigation
            isFirstStep={isFirstStep}
            onPrevious={onPreviousStep}
            currentStep={currentStep}
          />
        </DialogTitle>
        <DialogDescription>Create and manage estimates for your customers</DialogDescription>
      </DialogHeader>

      <div
        className="px-6 py-4 overflow-hidden flex-1 flex flex-col"
        role="tablist"
        aria-label="Estimate creation steps"
      >
        <MemoizedEstimateStepTabs
          steps={steps}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          className="flex-1 flex flex-col overflow-visible"
        >
          <div className="flex-1 overflow-y-auto pb-20" data-testid="estimate-form-content">
            {formAndActions}
          </div>
        </MemoizedEstimateStepTabs>
      </div>
    </ShadcnDialogContent>
  );
};

// Export as memoized component to prevent unnecessary rerenders
export default memo(DialogContent);
