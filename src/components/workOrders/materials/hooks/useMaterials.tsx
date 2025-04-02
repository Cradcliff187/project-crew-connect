
import { useState, useEffect } from 'react';
import { useMaterialsFetch } from './useMaterialsFetch';
import { useMaterialOperations } from './useMaterialOperations';
import { useReceiptOperations } from './useReceiptOperations';
import { useVendors } from './useVendors';

export function useMaterials(workOrderId: string) {
  // Fetch materials data
  const { 
    materials, 
    loading, 
    error, 
    fetchMaterials 
  } = useMaterialsFetch(workOrderId);
  
  // Material CRUD operations
  const { 
    submitting, 
    handleAddMaterial, 
    handleDelete 
  } = useMaterialOperations(workOrderId, fetchMaterials);
  
  // Receipt operations
  const { 
    handleReceiptUploaded 
  } = useReceiptOperations(fetchMaterials);
  
  // Fetch vendors
  const { vendors } = useVendors();
  
  // Calculate total materials cost
  const totalMaterialsCost = materials.reduce((sum, material) => sum + material.total_price, 0);
  
  return {
    materials,
    loading,
    submitting,
    error,
    vendors,
    totalMaterialsCost,
    handleAddMaterial,
    handleDelete,
    handleReceiptUploaded,
    fetchMaterials
  };
}
