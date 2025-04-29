import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Loader2, Receipt, Plus, FileText } from 'lucide-react';
import VendorDialog from '@/components/vendors/VendorDialog';
import MaterialFormFields from './components/MaterialFormFields';
import TotalPriceDisplay from './components/TotalPriceDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toggle } from '@/components/ui/toggle';
import MaterialReceiptUpload from './components/MaterialReceiptUpload';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form } from '@/components/ui/form';

// Define Zod schema
const materialFormSchema = z.object({
  materialName: z.string().min(1, { message: 'Material name is required' }),
  quantity: z.number().min(0.01, { message: 'Quantity must be positive' }),
  unitPrice: z.number().min(0.01, { message: 'Unit price must be positive' }),
  vendorId: z.string().nullable(),
  // Add fields for receipt if needed by MaterialFormFields or handled separately
});
type MaterialFormValues = z.infer<typeof materialFormSchema>;

interface EnhancedAddMaterialFormProps {
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
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EnhancedAddMaterialForm = ({
  workOrderId,
  vendors,
  submitting,
  onMaterialPrompt,
  onVendorAdded,
  onSuccess,
  onCancel,
}: EnhancedAddMaterialFormProps) => {
  const [showVendorDialog, setShowVendorDialog] = useState(false);

  // Setup react-hook-form
  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: {
      materialName: '',
      quantity: 1,
      unitPrice: undefined, // Use undefined for optional number
      vendorId: null,
    },
  });

  // Receipt upload state
  const [includeReceipt, setIncludeReceipt] = useState(false);
  const [receiptTab, setReceiptTab] = useState<'material' | 'receipt'>('material');
  const [pendingMaterial, setPendingMaterial] = useState<any>(null);

  // Track if receipt should be uploaded immediately after material is added
  const [willUploadReceipt, setWillUploadReceipt] = useState(false);

  const handleSubmit = async (values: MaterialFormValues) => {
    const materialData = {
      materialName: values.materialName,
      quantity: values.quantity,
      unitPrice: values.unitPrice,
      vendorId: values.vendorId,
    };
    onMaterialPrompt(materialData);
    form.reset(); // Reset form after submission
    // Handle receipt logic if needed
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

  const toggleReceiptUpload = () => {
    setIncludeReceipt(!includeReceipt);
    if (!includeReceipt) {
      setReceiptTab('receipt');
    } else {
      setReceiptTab('material');
    }
  };

  const handleReceiptSuccess = (documentId: string) => {
    console.log('Receipt upload successful with document ID:', documentId);

    // Reset will upload flag
    setWillUploadReceipt(false);

    // Call the success handler
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Add Material</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="border-b px-4 pb-2">
            <Toggle
              pressed={includeReceipt}
              onPressedChange={toggleReceiptUpload}
              className="border data-[state=on]:bg-green-50 data-[state=on]:text-green-700 data-[state=on]:border-green-200"
            >
              {includeReceipt ? (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Include Receipt
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Receipt
                </>
              )}
            </Toggle>
          </div>

          <Tabs
            value={receiptTab}
            onValueChange={value => setReceiptTab(value as 'material' | 'receipt')}
          >
            <TabsList className="w-full">
              <TabsTrigger value="material" className="flex-1">
                Material Details
              </TabsTrigger>
              {includeReceipt && (
                <TabsTrigger value="receipt" className="flex-1">
                  Receipt Upload
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="material">
              <CardContent className="pt-4">
                <MaterialFormFields
                  form={form}
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
              </CardContent>
            </TabsContent>

            {includeReceipt && (
              <TabsContent value="receipt">
                <CardContent className="pt-4">
                  {pendingMaterial ? (
                    <MaterialReceiptUpload
                      workOrderId={workOrderId}
                      material={pendingMaterial}
                      vendorName={
                        form.watch('vendorId')
                          ? vendors.find(v => v.vendorid === form.watch('vendorId'))?.vendorname ||
                            ''
                          : ''
                      }
                      onSuccess={handleReceiptSuccess}
                      onCancel={() => setReceiptTab('material')}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                      <Receipt className="h-12 w-12 mb-3 opacity-40" />
                      <p>Add material details first, then upload a receipt.</p>
                      <p className="text-sm mt-2">
                        Click on the "Material Details" tab to fill in the information.
                      </p>
                    </div>
                  )}
                </CardContent>
              </TabsContent>
            )}
          </Tabs>

          <CardFooter>
            <div className="flex justify-end gap-2">
              {onCancel && (
                <Button variant="outline" onClick={onCancel} disabled={submitting}>
                  Cancel
                </Button>
              )}
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
            </div>
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

export default EnhancedAddMaterialForm;
