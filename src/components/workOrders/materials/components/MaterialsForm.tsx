import { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import VendorDialog from '@/components/vendors/VendorDialog';
import { toast } from '@/hooks/use-toast';
import { DialogFooter } from '@/components/ui/dialog';

// Define Zod schema (similar to AddMaterialForm)
const materialsFormSchema = z.object({
  materialName: z.string().min(1, { message: 'Material name is required' }),
  quantity: z.number().min(0.01, { message: 'Quantity must be positive' }),
  unitPrice: z.number().min(0.01, { message: 'Unit price must be positive' }),
  vendorId: z.string().nullable(),
});
type MaterialsFormValues = z.infer<typeof materialsFormSchema>;

interface MaterialsFormProps {
  workOrderId: string;
  vendors: { vendorid: string; vendorname: string }[];
  submitting: boolean;
  onMaterialPrompt: (material: {
    materialName: string;
    quantity: number;
    unitPrice: number;
    vendorId: string | null;
  }) => void;
  onVendorAdded?: () => void;
  onCancel?: () => void;
}

const MaterialsForm = ({
  workOrderId,
  vendors,
  submitting,
  onMaterialPrompt,
  onVendorAdded,
  onCancel,
}: MaterialsFormProps) => {
  // Remove manual field state
  // const [materialName, setMaterialName] = useState('');
  // const [quantity, setQuantity] = useState('1');
  // const [unitPrice, setUnitPrice] = useState('');
  // const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [showVendorDialog, setShowVendorDialog] = useState(false);
  // const [totalPrice, setTotalPrice] = useState(0); // RHF will handle this implicitly if needed

  // Setup RHF form
  const form = useForm<MaterialsFormValues>({
    resolver: zodResolver(materialsFormSchema),
    defaultValues: {
      materialName: '',
      quantity: 1,
      unitPrice: undefined,
      vendorId: null,
    },
  });

  // useEffect(() => { ... calculate total price ... }); // Remove useEffect for total price

  // Updated onSubmit handler
  const onSubmit = (values: MaterialsFormValues) => {
    onMaterialPrompt({
      materialName: values.materialName,
      quantity: values.quantity,
      unitPrice: values.unitPrice,
      vendorId: values.vendorId,
    });
    form.reset(); // Reset form
  };

  const handleVendorAdded = () => {
    setShowVendorDialog(false);
    if (onVendorAdded) {
      onVendorAdded();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Add Material</CardTitle>
      </CardHeader>
      {/* Wrap with Shadcn Form */}
      <Form {...form}>
        {/* Use RHF submit handler */}
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Use MaterialFormFields which expects the RHF form object */}
            <MaterialFormFields
              form={form}
              vendors={vendors}
              onAddVendorClick={() => setShowVendorDialog(true)}
              showVendorDialog={showVendorDialog}
              setShowVendorDialog={setShowVendorDialog}
              onVendorAdded={handleVendorAdded}
            />

            {/* Use RHF watch to get values for TotalPriceDisplay */}
            <TotalPriceDisplay
              unitPrice={form.watch('unitPrice')?.toString() || ''}
              quantity={form.watch('quantity')?.toString() || ''}
            />
          </CardContent>
          <CardFooter className="flex justify-between space-x-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
            {/* Use default primary button */}
            <Button type="submit" disabled={submitting} className="ml-auto">
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Material
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>

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

export default MaterialsForm;
