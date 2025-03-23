
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface FormActionsProps {
  onCancel: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  isLastStep?: boolean;
  currentStep?: string;
  onPreview?: () => void;
  isPreviewStep?: boolean;
}

const FormActions = ({ 
  onCancel, 
  onPrevious, 
  onNext, 
  isLastStep = false,
  currentStep,
  onPreview,
  isPreviewStep = false
}: FormActionsProps) => {
  // If we're in the multi-step mode
  if (currentStep) {
    return (
      <div className="flex justify-between pt-4 border-t">
        <div>
          {currentStep !== 'basic-info' && onPrevious && (
            <Button type="button" variant="outline" onClick={onPrevious}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          {onNext && (
            <Button 
              type="button" 
              className="bg-[#0485ea] hover:bg-[#0373ce]" 
              onClick={onNext}
            >
              {isLastStep ? 'Preview Estimate' : 'Next'}
              {!isLastStep && <ArrowRight className="h-4 w-4 ml-1" />}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Legacy mode for preview step
  return (
    <div className="flex justify-end gap-2 pt-4 border-t">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      {onPreview && !isPreviewStep && (
        <Button 
          type="button" 
          className="bg-[#0485ea] hover:bg-[#0373ce]" 
          onClick={onPreview}
        >
          Preview Estimate
        </Button>
      )}
    </div>
  );
};

export default FormActions;
