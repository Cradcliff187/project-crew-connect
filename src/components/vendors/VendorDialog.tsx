
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
import VendorForm, { VendorFormData } from './VendorForm';
import { useVendorSubmit } from './useVendorSubmit';
import { toast } from '@/hooks/use-toast';

interface VendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVendorAdded: () => void;
  initialData?: Partial<VendorFormData>;
  isEditing?: boolean;
}

const VendorDialog = ({
  open,
  onOpenChange,
  onVendorAdded,
  initialData,
  isEditing = false
}: VendorDialogProps) => {
  // Log the initial data to help with debugging
  console.log('VendorDialog initialData:', initialData);
  
  const handleSuccess = () => {
    onOpenChange(false); // Close dialog
    onVendorAdded(); // Refresh vendors list
    
    toast({
      title: isEditing ? "Vendor updated" : "Vendor created",
      description: `The vendor has been ${isEditing ? 'updated' : 'created'} successfully.`,
    });
  };
  
  const { isSubmitting, handleSubmit } = useVendorSubmit(handleSuccess, isEditing);
  
  const onSubmit = async (data: VendorFormData) => {
    // Ensure vendorid is passed for editing
    if (isEditing && initialData && 'vendorid' in initialData) {
      data.vendorid = initialData.vendorid;
      console.log('Submitting form with vendorid:', data.vendorid);
    }
    
    console.log('Form submitted with data:', data);
    await handleSubmit(data);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isEditing ? 'Edit Vendor' : 'Add New Vendor'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the vendor details below.'
              : 'Enter the vendor details below to add them to your system.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-grow pr-1 -mr-1">
          <VendorForm 
            onSubmit={onSubmit} 
            isSubmitting={isSubmitting} 
            initialData={initialData}
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
              form="vendor-form"
              className="bg-[#0485ea] hover:bg-[#0375d1] w-full sm:w-auto"
              disabled={isSubmitting}
            >
              <Check className="h-4 w-4 mr-1" />
              {isSubmitting 
                ? (isEditing ? 'Updating...' : 'Creating...') 
                : (isEditing ? 'Update Vendor' : 'Create Vendor')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VendorDialog;
