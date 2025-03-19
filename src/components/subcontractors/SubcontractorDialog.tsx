
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
import type { Subcontractor } from './utils';
import { useState, useEffect } from 'react';

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
  
  // Create a state to store the properly formatted form data
  const [formattedData, setFormattedData] = useState<Partial<SubcontractorFormData> | null>(null);
  
  // Effect to format the initialData when it changes or dialog opens
  useEffect(() => {
    if (!initialData) {
      setFormattedData(null);
      return;
    }
    
    // Format the data for the form
    const formatted: Partial<SubcontractorFormData> = {
      ...initialData,
      // Ensure subid is a string if it exists
      ...(isEditing && 'subid' in initialData && initialData.subid 
          ? { subid: String(initialData.subid) } 
          : {})
    };
    
    setFormattedData(formatted);
  }, [initialData, isEditing, open]);
  
  const handleSuccess = () => {
    onOpenChange(false); // Close dialog
    onSubcontractorAdded(); // Refresh subcontractors list
  };
  
  const { isSubmitting, handleSubmit } = useSubcontractorSubmit(handleSuccess, isEditing);
  
  const onSubmit = async (data: SubcontractorFormData) => {
    await handleSubmit(data);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
        
        <div className="overflow-y-auto py-4">
          {formattedData !== null && (
            <SubcontractorForm 
              onSubmit={onSubmit} 
              isSubmitting={isSubmitting} 
              initialData={formattedData}
              isEditing={isEditing}
            />
          )}
        </div>
        
        <DialogFooter className="sticky bottom-0 pt-4 bg-background">
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
