
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
      
      // Transform database response to WorkOrderMaterial format with both fields
      const addedMaterial: WorkOrderMaterial = {
        id: data[0].id,
        work_order_id: data[0].work_order_id,
        vendor_id: data[0].vendor_id,
        expense_name: data[0].material_name, // Map material_name to expense_name
        material_name: data[0].material_name, // Keep material_name for compatibility
        quantity: data[0].quantity,
        unit_price: data[0].unit_price,
        total_price: data[0].total_price,
        receipt_document_id: data[0].receipt_document_id,
        created_at: data[0].created_at,
        updated_at: data[0].updated_at,
        expense_type: data[0].expense_type || 'materials'
      };
      
      // Return the newly created material
      return addedMaterial;
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
