
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Package } from 'lucide-react';
import { WorkOrderMaterial } from '@/types/workOrder';
import { AddMaterialForm, MaterialsTable } from './materials';

interface WorkOrderMaterialsProps {
  workOrderId: string;
  onMaterialAdded?: () => void;
}

const WorkOrderMaterials = ({ workOrderId, onMaterialAdded }: WorkOrderMaterialsProps) => {
  const [materials, setMaterials] = useState<WorkOrderMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState<{ vendorid: string, vendorname: string }[]>([]);
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

  const handleAddMaterial = async (material: {
    materialName: string;
    quantity: number;
    unitPrice: number;
    vendorId: string | null;
  }) => {
    if (!material.materialName.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter a material name.',
        variant: 'destructive',
      });
      return;
    }
    
    if (material.quantity <= 0 || material.unitPrice <= 0) {
      toast({
        title: 'Invalid Values',
        description: 'Quantity and price must be greater than zero.',
        variant: 'destructive',
      });
      return;
    }
    
    const totalPrice = material.quantity * material.unitPrice;
    
    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('work_order_materials')
        .insert({
          work_order_id: workOrderId,
          vendor_id: material.vendorId,
          material_name: material.materialName,
          quantity: material.quantity,
          unit_price: material.unitPrice,
          total_price: totalPrice,
        });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Material Added',
        description: 'Material has been added successfully.',
      });
      
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
  
  // Calculate total materials cost
  const totalMaterialsCost = materials.reduce((sum, material) => sum + material.total_price, 0);

  // Handle vendor added callback
  const handleVendorAdded = () => {
    // Refresh vendors list
    fetchVendors();
  };
  
  return (
    <div className="space-y-6">
      <AddMaterialForm 
        vendors={vendors}
        onSubmit={handleAddMaterial}
        submitting={submitting}
        onVendorAdded={handleVendorAdded}
      />
      
      <MaterialsTable 
        materials={materials}
        loading={loading}
        vendors={vendors}
        onDelete={handleDelete}
        totalCost={totalMaterialsCost}
      />
    </div>
  );
};

export default WorkOrderMaterials;
