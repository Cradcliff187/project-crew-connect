
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Loader2 } from 'lucide-react';
import VendorDialog from '@/components/vendors/VendorDialog';
import ExpenseFormFields from './components/ExpenseFormFields';
import TotalPriceDisplay from './components/TotalPriceDisplay';

interface AddExpenseFormProps {
  workOrderId: string; // The work order ID is required
  vendors: { vendorid: string, vendorname: string }[];
  submitting: boolean;
  onExpensePrompt: (expense: {
    expenseName: string;
    quantity: number;
    unitPrice: number;
    vendorId: string | null;
  }) => void;
  onVendorAdded?: () => void;
  onSuccess?: () => void; // Optional callback for when form submission succeeds
}

const AddExpenseForm = ({ 
  workOrderId,
  vendors, 
  submitting,
  onExpensePrompt,
  onVendorAdded,
  onSuccess
}: AddExpenseFormProps) => {
  // Form state
  const [expenseName, setExpenseName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [showVendorDialog, setShowVendorDialog] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const qtyValue = parseFloat(quantity);
    const priceValue = parseFloat(unitPrice);
    
    const expenseData = {
      expenseName,
      quantity: qtyValue,
      unitPrice: priceValue,
      vendorId: selectedVendor
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
            vendors={vendors}
            onAddVendorClick={() => setShowVendorDialog(true)}
          />
          
          <TotalPriceDisplay unitPrice={unitPrice} quantity={quantity} />
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full md:w-auto bg-[#0485ea] hover:bg-[#0375d1]"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Submit
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
