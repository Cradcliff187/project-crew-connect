import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Loader2 } from 'lucide-react';
import VendorDialog from '@/components/vendors/VendorDialog';
import MaterialFormFields from './components/MaterialFormFields';
import TotalPriceDisplay from './components/TotalPriceDisplay';
import { DialogFooter } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface AddMaterialFormProps {
  workOrderId: string; // The work order ID is required
  vendors: { vendorid: string; vendorname: string }[];
  submitting: boolean;
  onMaterialPrompt: (material: {
    materialName: string;
    quantity: number;
    unitPrice: number;
    vendorId: string | null;
  }) => void;
  onVendorAdded?: () => void;
  onSuccess?: () => void; // Optional callback for when form submission succeeds
  onOpenChange: (open: boolean) => void;
}

// Define Zod schema (same as EnhancedAddMaterialForm likely)
const materialFormSchema = z.object({
  materialName: z.string().min(1, { message: 'Material name is required' }),
  quantity: z.number().min(0.01, { message: 'Quantity must be positive' }),
  unitPrice: z.number().min(0.01, { message: 'Unit price must be positive' }),
  vendorId: z.string().nullable(),
});
type MaterialFormValues = z.infer<typeof materialFormSchema>;

const AddMaterialForm = ({
  workOrderId,
  vendors,
  submitting,
  onMaterialPrompt,
  onVendorAdded,
  onSuccess,
  onOpenChange,
}: AddMaterialFormProps) => {
  // Remove manual field state
  // const [materialName, setMaterialName] = useState('');
  // const [quantity, setQuantity] = useState('1');
  // const [unitPrice, setUnitPrice] = useState('');
  // const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [showVendorDialog, setShowVendorDialog] = useState(false);

  // Setup RHF form
  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: {
      materialName: '',
      quantity: 1,
      unitPrice: undefined,
      vendorId: null,
    },
  });

  // Updated onSubmit handler
  const onSubmit = async (values: MaterialFormValues) => {
    try {
      await handleAddMaterial({
        materialName: values.materialName,
        quantity: values.quantity,
        unitPrice: values.unitPrice,
        vendorId: values.vendorId,
      });
      form.reset(); // Reset form on success
      if (onSuccess) onSuccess();
    } catch (error) {
      // Error handled by handleAddMaterial hook (toast)
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>Add Material to Work Order</DialogTitle>
          <DialogDescription>Enter the details for the material used.</DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <MaterialFormFields
            form={form} // Pass form object
            vendors={vendors}
            onAddVendorClick={() => setShowVendorDialog(true)}
            showVendorDialog={showVendorDialog}
            setShowVendorDialog={setShowVendorDialog}
            onVendorAdded={handleVendorAdded}
          />
          <TotalPriceDisplay
            unitPrice={form.watch('unitPrice')?.toString() || ''}
            quantity={form.watch('quantity')?.toString() || ''}
          />
        </div>

        <DialogFooter>
          <Button type="submit" className="w-full md:w-auto" disabled={submitting}>
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Submit
              </>
            )}
          </Button>
        </DialogFooter>
      </form>

      {/* Vendor Dialog */}
      <VendorDialog
        open={showVendorDialog}
        onOpenChange={setShowVendorDialog}
        onVendorAdded={handleVendorAdded}
        isEditing={false}
      />
    </Form>
  );
};

export default AddMaterialForm;
