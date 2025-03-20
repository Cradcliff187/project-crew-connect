
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Plus, Save, Trash2, DollarSign, Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { WorkOrderMaterial } from '@/types/workOrder';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface WorkOrderMaterialsProps {
  workOrderId: string;
  onMaterialAdded?: () => void;
}

const WorkOrderMaterials = ({ workOrderId, onMaterialAdded }: WorkOrderMaterialsProps) => {
  const [materials, setMaterials] = useState<WorkOrderMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState<{ vendorid: string, vendorname: string }[]>([]);
  
  // Form state
  const [materialName, setMaterialName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('work_order_materials')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setMaterials(data || []);
    } catch (error: any) {
      console.error('Error fetching materials:', error);
      toast({
        title: 'Error',
        description: 'Failed to load materials.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('vendorid, vendorname')
        .eq('status', 'ACTIVE');
      
      if (error) {
        throw error;
      }
      
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };
  
  useEffect(() => {
    fetchMaterials();
    fetchVendors();
  }, [workOrderId]);
  
  const resetForm = () => {
    setMaterialName('');
    setQuantity('1');
    setUnitPrice('');
    setSelectedVendor(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!materialName.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter a material name.',
        variant: 'destructive',
      });
      return;
    }
    
    if (parseFloat(quantity) <= 0 || parseFloat(unitPrice) <= 0) {
      toast({
        title: 'Invalid Values',
        description: 'Quantity and price must be greater than zero.',
        variant: 'destructive',
      });
      return;
    }
    
    const qtyValue = parseFloat(quantity);
    const priceValue = parseFloat(unitPrice);
    const totalPrice = qtyValue * priceValue;
    
    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('work_order_materials')
        .insert({
          work_order_id: workOrderId,
          vendor_id: selectedVendor,
          material_name: materialName,
          quantity: qtyValue,
          unit_price: priceValue,
          total_price: totalPrice,
        });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Material Added',
        description: 'Material has been added successfully.',
      });
      
      // Reset form
      resetForm();
      
      // Refresh materials list
      fetchMaterials();

      // Notify parent component if provided
      if (onMaterialAdded) {
        onMaterialAdded();
      }
    } catch (error: any) {
      console.error('Error adding material:', error);
      toast({
        title: 'Error',
        description: 'Failed to add material. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('work_order_materials')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Material Deleted',
        description: 'The material has been deleted successfully.',
      });
      
      // Refresh materials list
      fetchMaterials();

      // Notify parent component if provided
      if (onMaterialAdded) {
        onMaterialAdded();
      }
    } catch (error: any) {
      console.error('Error deleting material:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete material. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Find vendor name by ID
  const getVendorName = (vendorId: string | null) => {
    if (!vendorId) return '-';
    const vendor = vendors.find(v => v.vendorid === vendorId);
    return vendor ? vendor.vendorname : 'Unknown Vendor';
  };
  
  // Calculate total materials cost
  const totalMaterialsCost = materials.reduce((sum, material) => sum + material.total_price, 0);
  
  return (
    <div className="space-y-6">
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
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Materials List</h3>
          <p className="text-sm font-medium">
            Total: {formatCurrency(totalMaterialsCost)}
          </p>
        </div>
        
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : materials.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No materials have been added to this work order yet.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">{material.material_name}</TableCell>
                    <TableCell>{getVendorName(material.vendor_id)}</TableCell>
                    <TableCell>{material.quantity}</TableCell>
                    <TableCell>{formatCurrency(material.unit_price)}</TableCell>
                    <TableCell>{formatCurrency(material.total_price)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(material.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkOrderMaterials;
