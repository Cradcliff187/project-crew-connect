import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, X, Loader2 } from 'lucide-react';
import VendorDialog from '@/components/vendors/VendorDialog';
import ExpenseFormFields from './components/ExpenseFormFields';
import TotalPriceDisplay from './components/TotalPriceDisplay';
import { toast } from '@/hooks/use-toast';

interface AddExpenseFormProps {
  workOrderId: string; // The work order ID is required
  vendors: { vendorid: string; vendorname: string }[];
  submitting: boolean;
  onExpensePrompt: (expense: {
    expenseName: string;
    quantity: number;
    unitPrice: number;
    vendorId: string | null;
    expenseType: string;
  }) => void;
  onVendorAdded?: () => void;
  onSuccess?: () => void; // Optional callback for when form submission succeeds
  onCancel?: () => void; // Optional callback for when the user cancels
}

const AddExpenseForm = ({
  workOrderId,
  vendors,
  submitting,
  onExpensePrompt,
  onVendorAdded,
  onSuccess,
  onCancel,
}: AddExpenseFormProps) => {
  // Form state
  const [expenseName, setExpenseName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [expenseType, setExpenseType] = useState('MATERIAL'); // Default to materials
  const [showVendorDialog, setShowVendorDialog] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the form
    if (!expenseName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an expense name',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedVendor) {
      toast({
        title: 'Error',
        description: 'Please select a vendor',
        variant: 'destructive',
      });
      return;
    }

    if (!unitPrice || parseFloat(unitPrice) <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid unit price',
        variant: 'destructive',
      });
      return;
    }

    const qtyValue = parseFloat(quantity);
    const priceValue = parseFloat(unitPrice);

    const expenseData = {
      expenseName,
      quantity: qtyValue,
      unitPrice: priceValue,
      vendorId: selectedVendor,
      expenseType,
    };

    // Submit the form data
    onExpensePrompt(expenseData);

    // Call onSuccess if provided
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleVendorAdded = () => {
    // Close the dialog
    setShowVendorDialog(false);

    // Notify parent to refresh vendors
    if (onVendorAdded) {
      onVendorAdded();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Add Expense</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <ExpenseFormFields
            expenseName={expenseName}
            setExpenseName={setExpenseName}
            quantity={quantity}
            setQuantity={setQuantity}
            unitPrice={unitPrice}
            setUnitPrice={setUnitPrice}
            selectedVendor={selectedVendor}
            setSelectedVendor={setSelectedVendor}
            expenseType={expenseType}
            setExpenseType={setExpenseType}
            vendors={vendors}
            onAddVendorClick={() => setShowVendorDialog(true)}
          />

          <TotalPriceDisplay unitPrice={unitPrice} quantity={quantity} />
        </CardContent>
        <CardFooter className="flex justify-between space-x-2">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={submitting}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" className="bg-[#0485ea] hover:bg-[#0375d1]" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Continue to Receipt
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </CardFooter>
      </form>

      {/* Vendor Dialog */}
      <VendorDialog
        open={showVendorDialog}
        onOpenChange={setShowVendorDialog}
        onVendorAdded={handleVendorAdded}
        isEditing={false}
      />
    </Card>
  );
};

export default AddExpenseForm;
