import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import EnhancedAddMaterialForm from '../../EnhancedAddMaterialForm';

interface AddMaterialSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderId: string;
  vendors: { vendorid: string; vendorname: string }[];
  submitting: boolean;
  onMaterialPrompt: (materialData: any) => void;
  onVendorAdded: () => void;
  onSuccess: () => void;
}

const AddMaterialSheet = ({
  open,
  onOpenChange,
  workOrderId,
  vendors,
  submitting,
  onMaterialPrompt,
  onVendorAdded,
  onSuccess,
}: AddMaterialSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Material</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <EnhancedAddMaterialForm
            workOrderId={workOrderId}
            vendors={vendors}
            submitting={submitting}
            onMaterialPrompt={onMaterialPrompt}
            onVendorAdded={onVendorAdded}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddMaterialSheet;
