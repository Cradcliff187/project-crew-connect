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
  isEditing = false,
}: SubcontractorDialogProps) => {
  // Properly prepare form data to ensure numeric values are processed correctly
  const formData = initialData
    ? {
        ...initialData,
        // Ensure these fields are properly typed
        subid: 'subid' in initialData ? initialData.subid : undefined,
        specialty_ids: 'specialty_ids' in initialData ? initialData.specialty_ids || [] : [],
        // Ensure hourly_rate is correctly typed
        hourly_rate: typeof initialData.hourly_rate === 'number' ? initialData.hourly_rate : null,
      }
    : undefined;

  // Only log when there's actual data to process
  if (formData) {
    console.log('Processing existing subcontractor data:', formData);
  }

  const handleSuccess = () => {
    onOpenChange(false); // Close dialog
    onSubcontractorAdded(); // Refresh subcontractors list

    toast({
      title: isEditing ? 'Subcontractor updated' : 'Subcontractor created',
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
        title: 'Error',
        description: 'There was a problem submitting the form. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={newOpenState => {
        // Only allow closing the dialog if we're not in the middle of submitting
        if (!isSubmitting || !newOpenState) {
          onOpenChange(newOpenState);
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col overflow-hidden">
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

        <div className="overflow-y-auto flex-grow pr-1 -mr-1">
          <SubcontractorForm
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            initialData={formData}
            isEditing={isEditing}
          />
        </div>

        <DialogFooter className="pt-4 mt-2 border-t sticky bottom-0 bg-background">
          <div className="flex gap-2 w-full justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              type="submit"
              form="subcontractor-form"
              className="bg-[#0485ea] hover:bg-[#0375d1] w-full sm:w-auto"
              disabled={isSubmitting}
            >
              <Check className="h-4 w-4 mr-1" />
              {isSubmitting
                ? isEditing
                  ? 'Updating...'
                  : 'Creating...'
                : isEditing
                  ? 'Update Subcontractor'
                  : 'Create Subcontractor'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubcontractorDialog;
