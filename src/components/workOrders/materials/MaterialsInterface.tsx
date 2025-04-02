
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import MaterialsForm from './components/MaterialsForm';
import MaterialsTable from './components/MaterialsTable';
import { WorkOrderMaterial } from '@/types/workOrder';
import { useMaterials } from './hooks/useMaterials';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/utils';

interface MaterialsInterfaceProps {
  workOrderId: string;
  onMaterialAdded?: () => void;
}

const MaterialsInterface: React.FC<MaterialsInterfaceProps> = ({
  workOrderId,
  onMaterialAdded
}) => {
  const {
    materials,
    loading,
    submitting,
    vendors,
    totalMaterialsCost,
    handleAddMaterial,
    handleDelete,
    handleReceiptUploaded,
    fetchMaterials
  } = useMaterials(workOrderId);

  // Handle material added
  const handleMaterialPrompt = async (materialData: any) => {
    await handleAddMaterial({
      materialName: materialData.materialName,
      quantity: materialData.quantity,
      unitPrice: materialData.unitPrice,
      vendorId: materialData.vendorId
    });

    // Refresh materials and notify parent
    fetchMaterials();
    if (onMaterialAdded) {
      onMaterialAdded();
    }
  };

  // Handle vendor added
  const handleVendorAdded = () => {
    fetchMaterials();
  };

  // Handle receipt attachment
  const handleReceiptAttached = async (materialId: string, documentId: string) => {
    await handleReceiptUploaded(materialId, documentId);
    fetchMaterials();
    if (onMaterialAdded) {
      onMaterialAdded();
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <MaterialsForm
            workOrderId={workOrderId}
            vendors={vendors}
            submitting={submitting}
            onMaterialPrompt={handleMaterialPrompt}
            onVendorAdded={handleVendorAdded}
          />
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Materials Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Items:</span>
                  <span className="font-medium">{materials.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Materials Cost:</span>
                  <span className="font-semibold">{formatCurrency(totalMaterialsCost)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">With Receipts:</span>
                  <span className="font-medium">
                    {materials.filter(m => m.receipt_document_id).length} / {materials.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#0485ea]" />
          </div>
        ) : (
          <MaterialsTable
            materials={materials}
            workOrderId={workOrderId}
            vendors={vendors}
            onDelete={handleDelete}
            onReceiptAttached={handleReceiptAttached}
          />
        )}
      </div>
    </div>
  );
};

export default MaterialsInterface;
