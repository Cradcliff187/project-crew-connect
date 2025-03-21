
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { WorkOrderMaterial } from '@/types/workOrder';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MaterialReceiptUpload, MaterialsTableContent } from './components';

interface MaterialsTableProps {
  materials: WorkOrderMaterial[];
  loading: boolean;
  vendors: { vendorid: string, vendorname: string }[];
  onDelete: (id: string) => Promise<void>;
  totalCost: number;
  workOrderId: string;
  onReceiptUploaded?: (materialId: string, documentId: string) => Promise<void>;
}

const MaterialsTable = ({ 
  materials, 
  loading, 
  vendors, 
  onDelete,
  totalCost,
  workOrderId,
  onReceiptUploaded
}: MaterialsTableProps) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<WorkOrderMaterial | null>(null);
  
  // Find vendor name by ID
  const getVendorName = (vendorId: string | null) => {
    if (!vendorId) return '-';
    const vendor = vendors.find(v => v.vendorid === vendorId);
    return vendor ? vendor.vendorname : 'Unknown Vendor';
  };

  const handleOpenReceiptUpload = (material: WorkOrderMaterial) => {
    setSelectedMaterial(material);
    setUploadDialogOpen(true);
  };

  const handleReceiptUploaded = async (documentId: string) => {
    if (selectedMaterial && onReceiptUploaded) {
      await onReceiptUploaded(selectedMaterial.id, documentId);
    }
    setUploadDialogOpen(false);
    setSelectedMaterial(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Materials List</h3>
        <p className="text-sm font-medium">
          Total: {formatCurrency(totalCost)}
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
        <MaterialsTableContent 
          materials={materials}
          vendors={vendors}
          onDelete={onDelete}
          onReceiptClick={handleOpenReceiptUpload}
        />
      )}

      {/* Material Receipt Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedMaterial?.receipt_document_id ? 'View Receipt for ' : 'Upload Receipt for '}
              {selectedMaterial?.material_name}
            </DialogTitle>
          </DialogHeader>
          {selectedMaterial && (
            <MaterialReceiptUpload 
              workOrderId={workOrderId}
              material={selectedMaterial}
              vendorName={getVendorName(selectedMaterial.vendor_id)}
              onSuccess={handleReceiptUploaded}
              onCancel={() => setUploadDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaterialsTable;
