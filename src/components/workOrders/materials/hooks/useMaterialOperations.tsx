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
        entity_id: workOrderId,
        entity_type: 'WORK_ORDER',
        description: material.materialName,
        expense_type: 'MATERIAL',
        quantity: material.quantity,
        unit_price: material.unitPrice,
        amount: totalPrice,
        vendor_id: material.vendorId,
      });

      // Validate that workOrderId is a valid UUID
      if (
        !workOrderId ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workOrderId)
      ) {
        throw new Error(`Invalid work order ID format: ${workOrderId}`);
      }

      // Insert into the expenses table
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          entity_id: workOrderId,
          entity_type: 'WORK_ORDER',
          description: material.materialName,
          expense_type: 'MATERIAL',
          quantity: material.quantity,
          unit_price: material.unitPrice,
          amount: totalPrice,
          vendor_id: material.vendorId,
        })
        .select();

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      console.log('Material added successfully:', data);

      toast({
        title: 'Material Added',
        description: 'Material has been added successfully.',
      });

      // Transform database response to WorkOrderMaterial format
      const addedMaterial: WorkOrderMaterial = {
        id: data[0].id,
        work_order_id: data[0].entity_id,
        vendor_id: data[0].vendor_id,
        expense_name: data[0].description,
        material_name: data[0].description, // Keep material_name for compatibility
        quantity: data[0].quantity,
        unit_price: data[0].unit_price,
        total_price: data[0].amount,
        receipt_document_id: data[0].document_id,
        created_at: data[0].created_at,
        updated_at: data[0].updated_at,
        expense_type: data[0].expense_type || 'MATERIAL',
        source_type: 'material' as const,
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
      // First, fetch the material to get the document_id if it exists
      const { data: material, error: fetchError } = await supabase
        .from('expenses')
        .select('document_id, description')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      console.log('Deleting material with ID:', id, 'Receipt document ID:', material?.document_id);

      // If there's a receipt document, fetch its storage_path
      if (material?.document_id) {
        const { data: document, error: docError } = await supabase
          .from('documents')
          .select('storage_path')
          .eq('document_id', material.document_id)
          .single();

        if (docError && docError.code !== 'PGRST116') {
          // PGRST116 is "Not found" which might happen if the document was already deleted
          console.warn('Error fetching document:', docError);
          // Continue with deletion even if we can't fetch the document
        } else if (document?.storage_path) {
          console.log('Deleting file from storage:', document.storage_path);

          // Delete the file from storage
          const { error: storageError } = await supabase.storage
            .from('construction_documents')
            .remove([document.storage_path]);

          if (storageError) {
            console.warn('Error deleting file from storage:', storageError);
            // Continue with deletion even if we can't delete the file
          }

          // Delete the document record
          await supabase.from('documents').delete().eq('document_id', material.document_id);
        }
      }

      // Delete the expense record from the database
      const { error } = await supabase.from('expenses').delete().eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: 'Material Deleted',
        description: `The material "${material?.description || ''}" has been deleted successfully.`,
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
    handleDelete,
  };
}
