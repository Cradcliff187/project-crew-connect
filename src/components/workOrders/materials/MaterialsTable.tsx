
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, Receipt } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { WorkOrderMaterial } from '@/types/workOrder';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { EntityType } from '@/components/documents/schemas/documentSchema';

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
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenReceiptUpload(material)}
                        className="text-[#0485ea] hover:text-[#0375d1] hover:bg-blue-50 flex items-center"
                      >
                        <Receipt className="h-4 w-4 mr-1" />
                        {material.receipt_document_id ? 'Update Receipt' : 'Add Receipt'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(material.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Delete Material"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Material Receipt Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload Receipt for {selectedMaterial?.material_name}</DialogTitle>
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

// Material Receipt Upload component - simplified version of EnhancedDocumentUpload
interface MaterialReceiptUploadProps {
  workOrderId: string;
  material: WorkOrderMaterial;
  vendorName: string;
  onSuccess: (documentId: string) => void;
  onCancel: () => void;
}

const MaterialReceiptUpload = ({ 
  workOrderId, 
  material, 
  vendorName,
  onSuccess, 
  onCancel 
}: MaterialReceiptUploadProps) => {
  return (
    <div className="py-2">
      <div className="mb-4 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-sm font-medium text-gray-500">Material</p>
            <p className="text-sm">{material.material_name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Vendor</p>
            <p className="text-sm">{vendorName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Amount</p>
            <p className="text-sm">{formatCurrency(material.total_price)}</p>
          </div>
        </div>
      </div>
      
      <EnhancedDocumentUpload 
        entityType={"WORK_ORDER" as EntityType}
        entityId={workOrderId}
        onSuccess={(documentId: string) => {
          if (documentId) {
            onSuccess(documentId);
          }
        }}
        onCancel={onCancel}
        isReceiptUpload={true}
        prefillData={{
          amount: material.total_price,
          vendorId: material.vendor_id || undefined,
          materialName: material.material_name
        }}
      />
    </div>
  );
};
