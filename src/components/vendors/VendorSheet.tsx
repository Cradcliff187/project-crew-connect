
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import VendorForm, { VendorFormData } from './VendorForm';
import { useVendorSubmit } from './useVendorSubmit';

interface VendorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVendorAdded: () => void;
  initialData?: Partial<VendorFormData>;
  isEditing?: boolean;
}

const VendorSheet = ({
  open,
  onOpenChange,
  onVendorAdded,
  initialData = {}, // Provide empty object as default
  isEditing = false
}: VendorSheetProps) => {
  // Log the initial data to help with debugging
  console.log('VendorSheet initialData:', initialData);
  
  const handleSuccess = () => {
    // First close the sheet and refresh the vendors list
    onOpenChange(false);
    onVendorAdded();
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
    <Sheet open={open} onOpenChange={(newOpenState) => {
      // Only allow closing the sheet if we're not in the middle of submitting
      if (!isSubmitting || !newOpenState) {
        onOpenChange(newOpenState);
      }
    }}>
      <SheetContent className="sm:max-w-md w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold">
            {isEditing ? 'Edit Vendor' : 'Add New Vendor'}
          </SheetTitle>
          <SheetDescription>
            {isEditing 
              ? 'Update the vendor details below.'
              : 'Enter the vendor details below to add them to your system.'}
          </SheetDescription>
        </SheetHeader>
        
        <div className="overflow-y-auto flex-grow pr-1 -mr-1 mt-6">
          <VendorForm 
            onSubmit={onSubmit} 
            isSubmitting={isSubmitting} 
            initialData={initialData}
          />
        </div>
        
        <SheetFooter className="pt-4 mt-2 border-t sticky bottom-0 bg-background">
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
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default VendorSheet;
