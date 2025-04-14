import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface EstimateFormHeaderProps {
  step: 'edit' | 'preview';
  onBackToEdit: (e: React.MouseEvent) => void;
}

const EstimateFormHeader = ({ step, onBackToEdit }: EstimateFormHeaderProps) => {
  return (
    <DialogHeader className="px-6 pt-6 pb-2">
      <DialogTitle className="text-2xl font-semibold text-[#0485ea]">
        {step === 'edit' ? 'Create New Estimate' : 'Review Estimate'}
        {step === 'preview' && (
          <Button type="button" variant="ghost" size="sm" onClick={onBackToEdit} className="ml-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Edit
          </Button>
        )}
      </DialogTitle>
      <p id="estimate-form-description" className="sr-only">
        Form to create a new estimate for a customer
      </p>
    </DialogHeader>
  );
};

export default EstimateFormHeader;
