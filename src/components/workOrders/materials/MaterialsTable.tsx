
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, Upload, Receipt } from 'lucide-react';
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
}

const MaterialsTable = ({ 
  materials, 
  loading, 
  vendors, 
  onDelete,
  totalCost,
  workOrderId
}: MaterialsTableProps) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  
  // Find vendor name by ID
  const getVendorName = (vendorId: string | null) => {
    if (!vendorId) return '-';
    const vendor = vendors.find(v => v.vendorid === vendorId);
    return vendor ? vendor.vendorname : 'Unknown Vendor';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Materials List</h3>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-[#0485ea]"
            onClick={() => setUploadDialogOpen(true)}
          >
            <Receipt className="h-4 w-4 mr-2" />
            Upload Receipt
          </Button>
          <p className="text-sm font-medium">
            Total: {formatCurrency(totalCost)}
          </p>
        </div>
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
                    <Button
                      variant="ghost"
                      size="sm"
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
        </div>
      )}

      {/* Receipt Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload Material Receipt</DialogTitle>
          </DialogHeader>
          <EnhancedDocumentUpload 
            entityType={"WORK_ORDER" as EntityType}
            entityId={workOrderId}
            onSuccess={() => setUploadDialogOpen(false)}
            onCancel={() => setUploadDialogOpen(false)}
            isReceiptUpload={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaterialsTable;
