
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface AddMaterialFormProps {
  vendors: { vendorid: string, vendorname: string }[];
  onSubmit: (material: {
    materialName: string;
    quantity: number;
    unitPrice: number;
    vendorId: string | null;
  }) => Promise<void>;
  submitting: boolean;
}

const AddMaterialForm = ({ 
  vendors, 
  onSubmit, 
  submitting 
}: AddMaterialFormProps) => {
  // Form state
  const [materialName, setMaterialName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const qtyValue = parseFloat(quantity);
    const priceValue = parseFloat(unitPrice);
    
    await onSubmit({
      materialName,
      quantity: qtyValue,
      unitPrice: priceValue,
      vendorId: selectedVendor
    });
    
    // Reset form
    setMaterialName('');
    setQuantity('1');
    setUnitPrice('');
    setSelectedVendor(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Add Material</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="materialName" className="text-sm font-medium">
                Material Name *
              </label>
              <Input
                id="materialName"
                placeholder="Enter material name"
                value={materialName}
                onChange={(e) => setMaterialName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="vendor" className="text-sm font-medium">
                Vendor
              </label>
              <Select 
                value={selectedVendor || undefined} 
                onValueChange={(value) => setSelectedVendor(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.vendorid} value={vendor.vendorid}>
                      {vendor.vendorname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-medium">
                Quantity *
              </label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="unitPrice" className="text-sm font-medium">
                Unit Price ($) *
              </label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                required
              />
            </div>
          </div>
          
          {(unitPrice && quantity) && (
            <div className="mt-4 text-right">
              <p className="text-sm font-medium">
                Total: {formatCurrency(parseFloat(unitPrice || "0") * parseFloat(quantity || "0"))}
              </p>
            </div>
          )}
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
                Add Material
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AddMaterialForm;
