
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderMaterial } from '@/types/workOrder';

export function useMaterials(workOrderId: string) {
  const [materials, setMaterials] = useState<WorkOrderMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchMaterials = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching materials for work order:', workOrderId);
      const { data, error } = await supabase
        .from('work_order_materials')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      console.log('Fetched materials:', data);
      setMaterials(data || []);
    } catch (error: any) {
      console.error('Error fetching materials:', error);
      setError(error.message);
      toast({
        title: 'Error',
        description: 'Failed to load materials: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (workOrderId) {
      fetchMaterials();
    }
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
      console.log('Adding material:', {
        work_order_id: workOrderId,
        vendor_id: material.vendorId,
        material_name: material.materialName,
        quantity: material.quantity,
        unit_price: material.unitPrice,
        total_price: totalPrice,
      });
      
      const { data, error } = await supabase
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
        throw error;
      }
      
      console.log('Material added successfully:', data);
      
      toast({
        title: 'Material Added',
        description: 'Material has been added successfully.',
      });
      
      // Refresh materials list
      fetchMaterials();
    } catch (error: any) {
      console.error('Error adding material:', error);
      toast({
        title: 'Error',
        description: 'Failed to add material: ' + error.message,
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
  
  const handleReceiptUploaded = async (materialId: string, documentId: string) => {
    try {
      console.log('Attaching receipt:', { materialId, documentId });
      const { error } = await supabase
        .from('work_order_materials')
        .update({ receipt_document_id: documentId })
        .eq('id', materialId);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Receipt Attached',
        description: 'Receipt has been attached to the material successfully.',
      });
      
      // Refresh materials list
      fetchMaterials();
    } catch (error: any) {
      console.error('Error attaching receipt:', error);
      toast({
        title: 'Error',
        description: 'Failed to attach receipt: ' + error.message,
        variant: 'destructive',
      });
    }
  };
  
  // Calculate total materials cost
  const totalMaterialsCost = materials.reduce((sum, material) => sum + material.total_price, 0);
  
  return {
    materials,
    loading,
    submitting,
    error,
    totalMaterialsCost,
    handleAddMaterial,
    handleDelete,
    handleReceiptUploaded,
    fetchMaterials
  };
}
