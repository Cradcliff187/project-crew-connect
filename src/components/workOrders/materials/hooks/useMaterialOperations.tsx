
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderMaterial } from '@/types/workOrder';

export function useMaterialOperations(workOrderId: string, fetchMaterials: () => Promise<void>) {
  const [submitting, setSubmitting] = useState(false);
  
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
      return null;
    }
    
    if (material.quantity <= 0 || material.unitPrice <= 0) {
      toast({
        title: 'Invalid Values',
        description: 'Quantity and price must be greater than zero.',
        variant: 'destructive',
      });
      return null;
    }
    
    const totalPrice = material.quantity * material.unitPrice;
    
    setSubmitting(true);
    
    try {
      // Detailed logging to help debug the issue
      console.log('Adding material with payload:', {
        work_order_id: workOrderId,
        vendor_id: material.vendorId,
        material_name: material.materialName,
        quantity: material.quantity,
        unit_price: material.unitPrice,
        total_price: totalPrice,
      });
      
      // Validate that workOrderId is a valid UUID
      if (!workOrderId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workOrderId)) {
        throw new Error(`Invalid work order ID format: ${workOrderId}`);
      }
      
      const { data, error, status } = await supabase
        .from('work_order_materials')
        .insert({
          work_order_id: workOrderId,
          vendor_id: material.vendorId,
          material_name: material.materialName,
          quantity: material.quantity,
          unit_price: material.unitPrice,
          total_price: totalPrice,
        })
        .select();
      
      if (error) {
        console.error('Supabase error details:', { error, status });
        throw error;
      }
      
      console.log('Material added successfully:', data);
      
      toast({
        title: 'Material Added',
        description: 'Material has been added successfully.',
      });
      
      // Return the newly created material
      return data[0] as WorkOrderMaterial;
    } catch (error: any) {
      console.error('Error adding material:', error);
      toast({
        title: 'Error',
        description: 'Failed to add material: ' + error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) {
      return;
    }
    
    try {
      console.log('Deleting material with ID:', id);
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
    } catch (error: any) {
      console.error('Error deleting material:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete material: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  return {
    submitting,
    handleAddMaterial,
    handleDelete
  };
}
