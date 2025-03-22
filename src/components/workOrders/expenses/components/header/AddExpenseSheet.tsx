
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import AddExpenseForm from '../../AddExpenseForm';

interface AddExpenseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderId: string;
  vendors: { vendorid: string, vendorname: string }[];
  submitting: boolean;
  onExpensePrompt: (expenseData: any) => void;
  onVendorAdded: () => void;
  onSuccess: () => void;
}

const AddExpenseSheet = ({
  open,
  onOpenChange,
  workOrderId,
  vendors,
  submitting,
  onExpensePrompt,
  onVendorAdded,
  onSuccess
}: AddExpenseSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Expense</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <AddExpenseForm
            workOrderId={workOrderId}
            vendors={vendors}
            submitting={submitting}
            onExpensePrompt={onExpensePrompt}
            onVendorAdded={onVendorAdded}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddExpenseSheet;
