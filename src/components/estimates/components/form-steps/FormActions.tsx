
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, FileText, Save } from 'lucide-react';

interface FormActionsProps {
  onCancel: () => void;
  onPreview: (e?: React.MouseEvent) => void;
  isPreviewStep: boolean;
  onSubmit?: () => void;
  isSubmitting?: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  onPreview,
  isPreviewStep,
  onSubmit,
  isSubmitting = false
}) => {
  return (
    <div className="flex justify-end mt-6 space-x-2">
      <Button type="button" variant="outline" onClick={onCancel}>
        <X className="h-4 w-4 mr-2" />
        Cancel
      </Button>
      
      {!isPreviewStep ? (
        <Button 
          type="button" 
          onClick={onPreview}
          className="bg-[#0485ea] hover:bg-[#0375d1]"
        >
          <FileText className="h-4 w-4 mr-2" />
          Preview
        </Button>
      ) : (
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
  );
};

export default FormActions;
