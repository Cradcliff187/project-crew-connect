import React, { useState, useEffect, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X, Upload } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useVendors } from '@/hooks/useVendors';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderMaterialFormValues } from '../schemas';
import { MaterialReceiptUpload } from './components/MaterialReceiptUpload';

interface EnhancedAddMaterialFormProps {
  workOrderId: string;
  onMaterialAdded: () => void;
  onCancel: () => void;
}

const EnhancedAddMaterialForm: React.FC<EnhancedAddMaterialFormProps> = ({
  workOrderId,
  onMaterialAdded,
  onCancel
}) => {
  const form = useFormContext<WorkOrderMaterialFormValues>();
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [vendorName, setVendorName] = useState<string | undefined>('');
  const material = form.watch();
  
  const { vendors, loading: vendorsLoading } = useVendors();
  
  useEffect(() => {
    if (material.vendor_id && vendors) {
      const selectedVendor = vendors.find(v => v.vendorid === material.vendor_id);
      setVendorName(selectedVendor?.vendorname);
    } else {
      setVendorName(undefined);
    }
  }, [material.vendor_id, vendors]);
  
  const handleReceiptUpload = useCallback((documentId: string) => {
    form.setValue('receipt_document_id', documentId);
    setShowReceiptUpload(false);
    onMaterialAdded();
    toast({
      title: 'Receipt Uploaded',
      description: 'The receipt has been attached to the material.',
    });
  }, [form, onMaterialAdded]);
  
  const handleAddMaterial = () => {
    form.handleSubmit(async (data) => {
      try {
        // Check if total_price is empty, and set it to 0 if so
        if (!data.total_price) {
          data.total_price = 0;
        }
        
        // Check if quantity is empty, and set it to 1 if so
        if (!data.quantity) {
          data.quantity = 1;
        }
        
        // Check if unit_price is empty, and set it to 0 if so
        if (!data.unit_price) {
          data.unit_price = 0;
        }
        
        onMaterialAdded();
        toast({
          title: 'Material Added',
          description: 'The material has been added to the work order.',
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    })();
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="expense_name">Material Name</Label>
          <Input
            id="expense_name"
            type="text"
            placeholder="Enter material name"
            {...form.register('expense_name')}
          />
        </div>
        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            placeholder="Enter quantity"
            defaultValue={1}
            {...form.register('quantity', { valueAsNumber: true })}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="unit_price">Unit Price</Label>
          <Input
            id="unit_price"
            type="number"
            step="0.01"
            placeholder="Enter unit price"
            {...form.register('unit_price', { valueAsNumber: true })}
          />
        </div>
        <div>
          <Label htmlFor="total_price">Total Price</Label>
          <Input
            id="total_price"
            type="number"
            step="0.01"
            placeholder="Enter total price"
            {...form.register('total_price', { valueAsNumber: true })}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="vendor_id">Vendor</Label>
        <Select onValueChange={(value) => form.setValue('vendor_id', value)} disabled={vendorsLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Select a vendor" />
          </SelectTrigger>
          <SelectContent>
            {vendors?.map((vendor) => (
              <SelectItem key={vendor.vendorid} value={vendor.vendorid}>
                {vendor.vendorname}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {showReceiptUpload ? (
        <MaterialReceiptUpload
          workOrderId={workOrderId}
          materialId={material.id}
          materialName={material.expense_name || 'Material'}
          vendorId={material.vendor_id}
          vendorName={vendorName}
          amount={material.total_price}
          onSuccess={handleReceiptUpload}
          onCancel={() => setShowReceiptUpload(false)}
        />
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start"
          onClick={() => setShowReceiptUpload(true)}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Receipt
        </Button>
      )}
      
      <div className="flex justify-between">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleAddMaterial}>
          <Plus className="h-4 w-4 mr-2" />
          Add Material
        </Button>
      </div>
    </div>
  );
};

export default EnhancedAddMaterialForm;
