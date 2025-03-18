
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import SubcontractorForm, { SubcontractorFormData } from './SubcontractorForm';
import { useSubcontractorSubmit } from './useSubcontractorSubmit';

interface SubcontractorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubcontractorAdded: () => void;
}

const SubcontractorDialog = ({
  open,
  onOpenChange,
  onSubcontractorAdded
}: SubcontractorDialogProps) => {
  const handleSuccess = () => {
    onOpenChange(false); // Close dialog
    onSubcontractorAdded(); // Refresh subcontractors list
  };
  
  const { isSubmitting, handleSubmit } = useSubcontractorSubmit(handleSuccess);
  
  const onSubmit = async (data: SubcontractorFormData) => {
    await handleSubmit(data);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Subcontractor</DialogTitle>
          <DialogDescription>
            Enter the subcontractor details below to add them to your system.
          </DialogDescription>
        </DialogHeader>
        
        <SubcontractorForm onSubmit={onSubmit} isSubmitting={isSubmitting} />
        
        <DialogFooter className="pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="subcontractor-form"
            className="bg-[#0485ea] hover:bg-[#0375d1]"
            disabled={isSubmitting}
          >
            <Check className="h-4 w-4 mr-1" />
            {isSubmitting ? 'Creating...' : 'Create Subcontractor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubcontractorDialog;
