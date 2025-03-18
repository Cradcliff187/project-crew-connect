
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { WorkOrder } from '@/types/workOrder';
import WorkOrderEmptyState from './WorkOrderEmptyState';
import WorkOrderLoadingState from './WorkOrderLoadingState';
import WorkOrderErrorState from './WorkOrderErrorState';
import WorkOrderDetailDialog from './WorkOrderDetailDialog';
import { formatDate } from '@/lib/utils';

interface WorkOrdersTableProps {
  workOrders: WorkOrder[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  onStatusChange: () => void;
}

const WorkOrdersTable = ({ 
  workOrders, 
  loading, 
  error, 
  searchQuery,
  onStatusChange
}: WorkOrdersTableProps) => {
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  
  // Filter work orders based on search query
  const filteredWorkOrders = workOrders.filter(workOrder => {
    const searchLower = searchQuery.toLowerCase();
    return (
      workOrder.title.toLowerCase().includes(searchLower) ||
      (workOrder.description?.toLowerCase() || '').includes(searchLower) ||
      (workOrder.po_number?.toLowerCase() || '').includes(searchLower) ||
      workOrder.status.toLowerCase().includes(searchLower)
    );
  });
  
  if (loading) {
    return <WorkOrderLoadingState />;
  }
  
  if (error) {
    return <WorkOrderErrorState error={error} />;
  }
  
  if (workOrders.length === 0) {
    return <WorkOrderEmptyState />;
  }
  
  const handleViewDetails = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
    setDetailOpen(true);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>PO Number</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWorkOrders.map((workOrder) => (
              <TableRow key={workOrder.work_order_id}>
                <TableCell className="font-medium">{workOrder.title}</TableCell>
                <TableCell>
                  <StatusBadge status={workOrder.status} />
                </TableCell>
                <TableCell className="capitalize">{workOrder.priority?.toLowerCase() || 'Medium'}</TableCell>
                <TableCell>{workOrder.po_number || '-'}</TableCell>
                <TableCell>{workOrder.scheduled_date ? formatDate(workOrder.scheduled_date) : 'Not scheduled'}</TableCell>
                <TableCell>{formatDate(workOrder.created_at)}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewDetails(workOrder)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedWorkOrder && (
        <WorkOrderDetailDialog
          workOrder={selectedWorkOrder}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onStatusChange={onStatusChange}
        />
      )}
    </>
  );
};

export default WorkOrdersTable;
