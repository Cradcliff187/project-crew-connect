
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
import SubcontractorForm from './SubcontractorForm';
import { SubcontractorFormData } from './types/formTypes';
import { useSubcontractorSubmit } from './useSubcontractorSubmit';
import { Subcontractor } from './utils/subcontractorUtils';

interface SubcontractorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubcontractorAdded: () => void;
  initialData?: Partial<SubcontractorFormData> | Subcontractor;
  isEditing?: boolean;
}

const SubcontractorDialog = ({
  open,
  onOpenChange,
  onSubcontractorAdded,
  initialData,
  isEditing = false
}: SubcontractorDialogProps) => {
  
  // Log the initial data to help with debugging
  console.log('SubcontractorDialog initialData:', initialData);
  
  const handleSuccess = () => {
    onOpenChange(false); // Close dialog
    onSubcontractorAdded(); // Refresh subcontractors list
  };
  
  const { isSubmitting, handleSubmit } = useSubcontractorSubmit(handleSuccess, isEditing);
  
  const onSubmit = async (data: SubcontractorFormData) => {
    // Create a new form data object to ensure we don't have any unexpected properties
    const formData: SubcontractorFormData = {
      ...data
    };
    
    // Ensure subid is passed for editing and is treated as a string
    if (isEditing && initialData && 'subid' in initialData) {
      formData.subid = String(initialData.subid);
      console.log('Submitting form with subid:', formData.subid);
    }
    
    console.log('Form submitted with data:', formData);
    await handleSubmit(formData);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isEditing ? 'Edit Subcontractor' : 'Add New Subcontractor'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the subcontractor details below.'
              : 'Enter the subcontractor details below to add them to your system.'}
          </DialogDescription>
        </DialogHeader>
        
        <SubcontractorForm 
          onSubmit={onSubmit} 
          isSubmitting={isSubmitting} 
          initialData={initialData}
          isEditing={isEditing}
        />
        
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
            {isSubmitting 
              ? (isEditing ? 'Updating...' : 'Creating...') 
              : (isEditing ? 'Update Subcontractor' : 'Create Subcontractor')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubcontractorDialog;
