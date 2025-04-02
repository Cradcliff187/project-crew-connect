
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { WorkOrderMaterial } from '@/types/workOrder';
import ReceiptButton from './ReceiptButton';
import { ReceiptUploadDialog, ReceiptViewerDialog } from '../dialogs/ReceiptDialog';
import { useDocumentViewer } from '@/hooks/useDocumentViewer';
import { useReceiptManager } from '../hooks/useReceiptManager';

interface MaterialsTableProps {
  materials: WorkOrderMaterial[];
  workOrderId: string;
  vendors: { vendorid: string; vendorname: string }[];
  onDelete: (id: string) => void;
  onReceiptAttached: (materialId: string, documentId: string) => Promise<void>;
}

const MaterialsTable = ({
  materials,
  workOrderId,
  vendors,
  onDelete,
  onReceiptAttached
}: MaterialsTableProps) => {
  const {
    showReceiptUpload,
    setShowReceiptUpload,
    selectedMaterial,
    setSelectedMaterial,
    viewingReceipt,
    setViewingReceipt,
    receiptDocument,
    handleReceiptClick,
    handleCloseReceiptViewer
  } = useReceiptManager();

  // Get vendor name based on vendor ID
  const getVendorName = (vendorId: string | null) => {
    if (!vendorId) return 'No Vendor';
    const vendor = vendors.find(v => v.vendorid === vendorId);
    return vendor ? vendor.vendorname : 'Unknown Vendor';
  };

  // Handle successful receipt upload
  const handleReceiptSuccess = async (materialId: string, documentId: string) => {
    await onReceiptAttached(materialId, documentId);
    setShowReceiptUpload(false);
  };

  // Handle receipt upload cancel
  const handleReceiptCancel = () => {
    setShowReceiptUpload(false);
    setSelectedMaterial(null);
  };

  if (materials.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No materials added yet. Add your first material using the form above.
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Material</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Receipt</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materials.map((material) => (
            <TableRow key={material.id}>
              <TableCell className="font-medium">{material.material_name}</TableCell>
              <TableCell>{material.quantity}</TableCell>
              <TableCell>{formatCurrency(material.unit_price)}</TableCell>
              <TableCell>{formatCurrency(material.total_price)}</TableCell>
              <TableCell>{getVendorName(material.vendor_id)}</TableCell>
              <TableCell>
                <ReceiptButton
                  material={material}
                  onClick={handleReceiptClick}
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(material.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Receipt Upload Dialog */}
      {selectedMaterial && (
        <ReceiptUploadDialog
          open={showReceiptUpload}
          material={selectedMaterial}
          workOrderId={workOrderId}
          vendorName={getVendorName(selectedMaterial.vendor_id)}
          onSuccess={handleReceiptSuccess}
          onCancel={handleReceiptCancel}
        />
      )}

      {/* Receipt Viewer Dialog */}
      <ReceiptViewerDialog
        open={viewingReceipt}
        onOpenChange={setViewingReceipt}
        receiptDocument={receiptDocument}
      />
    </>
  );
};

export default MaterialsTable;
