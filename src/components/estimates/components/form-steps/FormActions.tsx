
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

interface FormActionsProps {
  onCancel: () => void;
  onPrevious?: () => void;
  onNext?: (e?: React.MouseEvent) => void;
  isLastStep?: boolean;
  currentStep?: string;
  onPreview?: (e?: React.MouseEvent) => void;
  isPreviewStep?: boolean;
  onSubmit?: (e?: React.FormEvent) => void;
  isSubmitting?: boolean;
}

const FormActions = ({ 
  onCancel, 
  onPrevious, 
  onNext, 
  isLastStep = false,
  currentStep,
  onPreview,
  isPreviewStep = false,
  onSubmit,
  isSubmitting = false
}: FormActionsProps) => {
  // If we're in the multi-step mode
  if (currentStep) {
    return (
      <div className="flex justify-between pt-4 border-t">
        <div>
          {onPrevious && (
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
          
          {isLastStep && onSubmit ? (
            <Button 
              type="button" 
              className="bg-[#0485ea] hover:bg-[#0373ce] min-w-[120px]" 
              onClick={(e) => onSubmit(e)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting
                </>
              ) : (
                'Save Estimate'
              )}
            </Button>
          ) : onNext ? (
            <Button 
              type="button" 
              className="bg-[#0485ea] hover:bg-[#0373ce]" 
              onClick={(e) => onNext(e)}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : null}
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
          onClick={(e) => onPreview(e)}
        >
          Preview Estimate
        </Button>
      )}
      {isPreviewStep && (
        <Button 
          type="submit" 
          className="bg-[#0485ea] hover:bg-[#0373ce]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting
            </>
          ) : (
            'Save Estimate'
          )}
        </Button>
      )}
    </div>
  );
};

export default FormActions;
