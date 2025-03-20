
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
import { Subcontractor } from './utils/types';
import { toast } from '@/hooks/use-toast';

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
  
  // Properly prepare form data to ensure numeric values are processed correctly
  const formData = initialData
    ? {
        ...initialData,
        // Ensure these fields are properly typed
        subid: 'subid' in initialData ? initialData.subid : undefined,
        specialty_ids: 'specialty_ids' in initialData ? initialData.specialty_ids || [] : [],
        // Ensure rating is correctly typed to prevent errors in the Select component
        rating: typeof initialData.rating === 'number' ? initialData.rating : null,
        hourly_rate: typeof initialData.hourly_rate === 'number' ? initialData.hourly_rate : null,
        on_time_percentage: typeof initialData.on_time_percentage === 'number' ? initialData.on_time_percentage : null,
        quality_score: typeof initialData.quality_score === 'number' ? initialData.quality_score : null,
        safety_incidents: typeof initialData.safety_incidents === 'number' ? initialData.safety_incidents : null,
        response_time_hours: typeof initialData.response_time_hours === 'number' ? initialData.response_time_hours : null,
      }
    : undefined;
  
  console.log("Processed form data:", formData);
  
  const handleSuccess = () => {
    onOpenChange(false); // Close dialog
    onSubcontractorAdded(); // Refresh subcontractors list
    
    toast({
      title: isEditing ? "Subcontractor updated" : "Subcontractor created",
      description: `The subcontractor has been ${isEditing ? 'updated' : 'created'} successfully.`,
    });
  };
  
  const { isSubmitting, handleSubmit } = useSubcontractorSubmit(handleSuccess, isEditing);
  
  const onSubmit = async (data: SubcontractorFormData) => {
    try {
      // Ensure subid is passed for editing
      if (isEditing && initialData && 'subid' in initialData) {
        data.subid = initialData.subid;
      }
      
      console.log('Submitting subcontractor data:', data);
      await handleSubmit(data);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "There was a problem submitting the form. Please try again.",
        variant: "destructive"
      });
    }
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
          initialData={formData}
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
