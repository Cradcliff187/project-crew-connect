import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { WorkOrderMaterial } from '@/types/workOrder';
import MaterialsTableContent from './components/MaterialsTableContent';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Package2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@/components/ui/table';
import { Plus, MoreHorizontal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Vendor } from '@/components/vendors/types/vendorTypes';

interface MaterialsTableProps {
  materials: WorkOrderMaterial[];
  vendors: Vendor[];
  loading: boolean;
  error: string | null;
  totalCost: number;
  onDelete: (id: string) => void;
  onReceiptClick: (documentId: string) => void;
}

const MaterialsTable: React.FC<MaterialsTableProps> = ({
  materials,
  vendors,
  loading,
  error,
  totalCost,
  onDelete,
  onReceiptClick,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-pulse text-muted-foreground">Loading materials...</div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">Error loading materials: {error}</div>;
  }

  return (
    <Card className="shadow-sm border-primary/10">
      <CardContent className="p-0">
        <MaterialsTableContent
          materials={materials}
          vendors={vendors.map(v => ({ vendorid: v.vendorid, vendorname: v.vendorname }))}
          onDelete={async id => {
            onDelete(id);
          }}
          onReceiptClick={material => {
            const docId = material.receipt_document_id;
            if (docId) {
              onReceiptClick(docId);
            } else {
              console.warn(
                'Receipt click handler called without document ID on material',
                material
              );
            }
          }}
        />

        {materials.length > 0 ? (
          <div className="flex justify-between items-center bg-gray-50 p-4 border-t">
            <div className="flex items-center gap-2 text-gray-600">
              <Package2 size={18} />
              <span className="font-medium">Total Items: {materials.length}</span>
            </div>
            <div className="bg-primary/10 px-4 py-2 rounded-md flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Total Materials Cost:</span>
              <span className="text-lg font-bold text-primary">{formatCurrency(totalCost)}</span>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default MaterialsTable;
