import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import VendorDialog from '@/components/vendors/VendorDialog';
import { toast } from '@/hooks/use-toast';

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
  // Form state
  const [materialName, setMaterialName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [showVendorDialog, setShowVendorDialog] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  // Calculate total price when quantity or unit price changes
  useEffect(() => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;
    setTotalPrice(qty * price);
  }, [quantity, unitPrice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the form
    if (!materialName.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter a material name',
        variant: 'destructive',
      });
      return;
    }

    if (!unitPrice || parseFloat(unitPrice) <= 0) {
      toast({
        title: 'Invalid Price',
        description: 'Please enter a valid unit price',
        variant: 'destructive',
      });
      return;
    }

    // Submit the material data
    onMaterialPrompt({
      materialName,
      quantity: parseFloat(quantity) || 1,
      unitPrice: parseFloat(unitPrice) || 0,
      vendorId: selectedVendor,
    });

    // Reset form fields
    setMaterialName('');
    setQuantity('1');
    setUnitPrice('');
    setSelectedVendor(null);
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
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="material-name">Material Name</Label>
            <Input
              id="material-name"
              placeholder="Enter material name"
              value={materialName}
              onChange={e => setMaterialName(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="1"
                min="1"
                step="1"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit-price">Unit Price ($)</Label>
              <Input
                id="unit-price"
                type="number"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                value={unitPrice}
                onChange={e => setUnitPrice(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor</Label>
            <div className="flex gap-2">
              <select
                id="vendor"
                className="flex-1 w-full border border-input bg-background px-3 py-2 rounded-md"
                value={selectedVendor || ''}
                onChange={e => setSelectedVendor(e.target.value || null)}
                disabled={submitting}
              >
                <option value="">Select Vendor</option>
                {vendors.map(vendor => (
                  <option key={vendor.vendorid} value={vendor.vendorid}>
                    {vendor.vendorname}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={submitting}
                onClick={() => setShowVendorDialog(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          <div className="border rounded-md p-3 bg-muted/20">
            <div className="flex justify-between">
              <span>Total Price:</span>
              <span className="font-semibold">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            className="bg-[#0485ea] hover:bg-[#0375d1] ml-auto"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Material
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

export default MaterialsForm;
