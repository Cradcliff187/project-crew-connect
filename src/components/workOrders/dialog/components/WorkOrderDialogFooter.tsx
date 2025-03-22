
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Loader2, SaveIcon, X } from 'lucide-react';
import { WORK_ORDER_STEPS } from './WorkOrderStepTabs';

interface WorkOrderDialogFooterProps {
  currentStep: string;
  isSubmitting: boolean;
  isLoading: boolean;
  dataLoaded: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onCancel: () => void;
  onSubmit: () => void; // New prop for handling form submission
}

const WorkOrderDialogFooter = ({
  currentStep,
  isSubmitting,
  isLoading,
  dataLoaded,
  onPrevious,
  onNext,
  onCancel,
  onSubmit
}: WorkOrderDialogFooterProps) => {
  const isFirstStep = currentStep === WORK_ORDER_STEPS[0].id;
  const isLastStep = currentStep === WORK_ORDER_STEPS[WORK_ORDER_STEPS.length - 1].id;

  return (
    <DialogFooter className="border-t pt-4 mt-auto flex justify-between">
      <div>
        {!isFirstStep && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onPrevious}
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
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        
        {!isLastStep ? (
          <Button 
            type="button" 
            onClick={onNext}
            disabled={isLoading || !dataLoaded}
            className="bg-[#0485ea] text-white hover:bg-[#0373d1]"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button 
            type="button" // Changed from "submit" to "button" 
            onClick={onSubmit} // Use the onSubmit prop instead of form submission
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
  );
};

export default WorkOrderDialogFooter;
