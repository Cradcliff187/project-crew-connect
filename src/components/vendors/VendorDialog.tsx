
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
      <DialogContent className="sm:max-w-[500px]">
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
        
        <VendorForm 
          onSubmit={onSubmit} 
          isSubmitting={isSubmitting} 
          initialData={initialData}
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
            form="vendor-form"
            className="bg-[#0485ea] hover:bg-[#0375d1]"
            disabled={isSubmitting}
          >
            <Check className="h-4 w-4 mr-1" />
            {isSubmitting 
              ? (isEditing ? 'Updating...' : 'Creating...') 
              : (isEditing ? 'Update Vendor' : 'Create Vendor')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VendorDialog;
