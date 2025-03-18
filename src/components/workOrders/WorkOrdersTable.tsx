
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/ui/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import WorkOrderDetailDialog from './WorkOrderDetailDialog';
import WorkOrderEmptyState from './WorkOrderEmptyState';
import WorkOrderLoadingState from './WorkOrderLoadingState';
import WorkOrderErrorState from './WorkOrderErrorState';
import { WorkOrder } from '@/types/workOrder';

interface WorkOrdersTableProps {
  workOrders: WorkOrder[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  onStatusChange: () => void;
}

const WorkOrdersTable = ({ workOrders, loading, error, searchQuery, onStatusChange }: WorkOrdersTableProps) => {
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  // Filter work orders based on search query
  const filteredWorkOrders = workOrders.filter(wo => {
    const searchLower = searchQuery.toLowerCase();
    return (
      wo.title.toLowerCase().includes(searchLower) ||
      (wo.description && wo.description.toLowerCase().includes(searchLower)) ||
      (wo.po_number && wo.po_number.toLowerCase().includes(searchLower))
    );
  });
  
  const handleRowClick = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
    setIsDialogOpen(true);
  };
  
  if (loading) {
    return <WorkOrderLoadingState />;
  }
  
  if (error) {
    return <WorkOrderErrorState error={error} />;
  }
  
  if (workOrders.length === 0) {
    return <WorkOrderEmptyState />;
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Work Order</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date Created</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>PO #</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredWorkOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No work orders found matching your search.
              </TableCell>
            </TableRow>
          ) : (
            filteredWorkOrders.map((workOrder) => (
              <TableRow 
                key={workOrder.work_order_id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(workOrder)}
              >
                <TableCell className="font-medium">{workOrder.title}</TableCell>
                <TableCell>
                  <StatusBadge status={workOrder.status} size="sm" />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {workOrder.customer_id ? 'Customer' : 'No Customer'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(workOrder.created_at)}
                </TableCell>
                <TableCell className="text-muted-foreground capitalize">
                  {workOrder.priority || 'Medium'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {workOrder.po_number || '-'}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Change to correct path if this exists
                      navigate(`/WorkOrders/${workOrder.work_order_id}/edit`);
                    }}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {selectedWorkOrder && (
        <WorkOrderDetailDialog 
          workOrder={selectedWorkOrder} 
          open={isDialogOpen} 
          onOpenChange={setIsDialogOpen}
          onStatusChange={onStatusChange}
        />
      )}
    </div>
  );
};

export default WorkOrdersTable;
