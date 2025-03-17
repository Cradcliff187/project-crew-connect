
import { Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
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
}

const VendorDialog = ({
  open,
  onOpenChange,
  onVendorAdded
}: VendorDialogProps) => {
  const handleSuccess = () => {
    onOpenChange(false); // Close dialog
    onVendorAdded(); // Refresh vendors list
  };
  
  const { isSubmitting, handleSubmit } = useVendorSubmit(handleSuccess);
  
  const onSubmit = async (data: VendorFormData) => {
    await handleSubmit(data);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Vendor</DialogTitle>
          <DialogDescription>
            Enter the vendor details below to add them to your system.
          </DialogDescription>
        </DialogHeader>
        
        <VendorForm onSubmit={onSubmit} isSubmitting={isSubmitting} />
        
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
            {isSubmitting ? 'Creating...' : 'Create Vendor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VendorDialog;
