import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Save, ChevronLeft, ChevronRight } from 'lucide-react';

interface FormActionsProps {
  onCancel: () => void;
  onPrevious?: () => void;
  onNext?: (e?: React.MouseEvent) => void;
  isLastStep?: boolean;
  currentStep?: string;
  onSubmit?: (e?: React.FormEvent) => void;
  isSubmitting?: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  onPrevious,
  onNext,
  isLastStep = false,
  currentStep,
  onSubmit,
  isSubmitting = false,
}) => {
  return (
    <div className="flex justify-between mt-6">
      <div>
        {onPrevious && (
          <Button type="button" variant="outline" onClick={onPrevious} disabled={isSubmitting}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
        )}
      </div>

      <div className="flex space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>

        {onNext && !isLastStep && (
          <Button type="button" onClick={onNext} className="bg-[#0485ea] hover:bg-[#0375d1]">
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}

        {isLastStep && onSubmit && (
          <Button
            type="button"
            onClick={onSubmit}
            className="bg-[#0485ea] hover:bg-[#0375d1]"
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Create Estimate'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default FormActions;
