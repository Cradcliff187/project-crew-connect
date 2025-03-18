
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, MoreHorizontal } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import StatusBadge from '@/components/ui/StatusBadge';
import { WorkOrder } from '@/types/workOrder';
import WorkOrderEmptyState from './WorkOrderEmptyState';
import WorkOrderLoadingState from './WorkOrderLoadingState';
import WorkOrderErrorState from './WorkOrderErrorState';
import WorkOrderDetailDialog from './WorkOrderDetailDialog';
import { formatDate, formatCurrency } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

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
  const navigate = useNavigate();
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
      <div className="premium-card animate-in" style={{ animationDelay: '0.2s' }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Work Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Costs</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWorkOrders.map((workOrder) => (
              <TableRow 
                key={workOrder.work_order_id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleViewDetails(workOrder)}
              >
                <TableCell>
                  <div className="font-medium text-[#0485ea]">{workOrder.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {workOrder.po_number ? `PO #${workOrder.po_number}` : 'No PO Number'}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={workOrder.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Progress value={workOrder.progress || 0} className="h-2 w-[100px]" />
                    <span className="text-sm text-muted-foreground">{workOrder.progress || 0}%</span>
                  </div>
                </TableCell>
                <TableCell className="capitalize">{workOrder.priority?.toLowerCase() || 'Medium'}</TableCell>
                <TableCell>
                  <div className="font-medium">{formatCurrency(workOrder.materials_cost || 0)}</div>
                  <div className="text-xs text-muted-foreground">
                    of {formatCurrency(workOrder.total_cost || 0)}
                  </div>
                </TableCell>
                <TableCell>{workOrder.scheduled_date ? formatDate(workOrder.scheduled_date) : 'Not scheduled'}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(workOrder)}>
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem>Edit work order</DropdownMenuItem>
                      <DropdownMenuItem>Schedule</DropdownMenuItem>
                      <DropdownMenuItem>Add time log</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Generate report</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">Archive work order</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
