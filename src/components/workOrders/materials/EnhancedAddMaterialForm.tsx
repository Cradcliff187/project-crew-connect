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

interface EnhancedAddMaterialFormProps {
  workOrderId: string;
  vendors: { vendorid: string, vendorname: string }[];
  submitting: boolean;
  onMaterialPrompt: (material: {
    materialName: string;
    quantity: number;
    unitPrice: number;
    vendorId: string | null;
  }) => void;
  onVendorAdded?: () => void;
  onSuccess?: () => void;
}

const EnhancedAddMaterialForm = ({ 
  workOrderId,
  vendors, 
  submitting,
  onMaterialPrompt,
  onVendorAdded,
  onSuccess
}: EnhancedAddMaterialFormProps) => {
  // Form state
  const [materialName, setMaterialName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [showVendorDialog, setShowVendorDialog] = useState(false);
  
  // Receipt upload state
  const [includeReceipt, setIncludeReceipt] = useState(false);
  const [receiptTab, setReceiptTab] = useState<'material' | 'receipt'>('material');
  const [pendingMaterial, setPendingMaterial] = useState<any>(null);
  
  // Track if receipt should be uploaded immediately after material is added
  const [willUploadReceipt, setWillUploadReceipt] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const qtyValue = parseFloat(quantity);
    const priceValue = parseFloat(unitPrice);
    
    const materialData = {
      materialName,
      quantity: qtyValue,
      unitPrice: priceValue,
      vendorId: selectedVendor
    };
    
    // Submit the form data
    onMaterialPrompt(materialData);
    
    // If receipt upload is toggled ON, we'll set the flag
    // but the actual upload will happen in onSuccess
    if (includeReceipt) {
      setWillUploadReceipt(true);
    } else {
      // If we're not uploading a receipt, we can call onSuccess directly
      if (onSuccess) {
        onSuccess();
      }
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
    console.log("Receipt upload successful with document ID:", documentId);
    
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
      <form onSubmit={handleSubmit}>
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
        
        <Tabs value={receiptTab} onValueChange={(value) => setReceiptTab(value as 'material' | 'receipt')}>
          <TabsList className="w-full">
            <TabsTrigger value="material" className="flex-1">Material Details</TabsTrigger>
            {includeReceipt && (
              <TabsTrigger value="receipt" className="flex-1">Receipt Upload</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="material">
            <CardContent className="pt-4">
              <MaterialFormFields 
                materialName={materialName}
                setMaterialName={setMaterialName}
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
          </TabsContent>
          
          {includeReceipt && (
            <TabsContent value="receipt">
              <CardContent className="pt-4">
                {pendingMaterial ? (
                  <MaterialReceiptUpload
                    workOrderId={workOrderId}
                    material={pendingMaterial}
                    vendorName={selectedVendor ? (vendors.find(v => v.vendorid === selectedVendor)?.vendorname || '') : ''}
                    onSuccess={handleReceiptSuccess}
                    onCancel={() => setReceiptTab('material')}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <Receipt className="h-12 w-12 mb-3 opacity-40" />
                    <p>Add material details first, then upload a receipt.</p>
                    <p className="text-sm mt-2">Click on the "Material Details" tab to fill in the information.</p>
                  </div>
                )}
              </CardContent>
            </TabsContent>
          )}
        </Tabs>
        
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

export default EnhancedAddMaterialForm;
