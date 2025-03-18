
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Eye, Edit, Calendar, Clock, FileText, Archive } from 'lucide-react';
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
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';

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
  
  const getWorkOrderActions = (workOrder: WorkOrder): ActionGroup[] => {
    return [
      {
        items: [
          {
            label: 'View details',
            icon: <Eye className="w-4 h-4" />,
            onClick: (e) => handleViewDetails(workOrder)
          },
          {
            label: 'Edit work order',
            icon: <Edit className="w-4 h-4" />,
            onClick: (e) => console.log('Edit work order', workOrder.work_order_id)
          },
          {
            label: 'Schedule',
            icon: <Calendar className="w-4 h-4" />,
            onClick: (e) => console.log('Schedule work order', workOrder.work_order_id)
          },
          {
            label: 'Add time log',
            icon: <Clock className="w-4 h-4" />,
            onClick: (e) => console.log('Add time log', workOrder.work_order_id)
          }
        ]
      },
      {
        items: [
          {
            label: 'Generate report',
            icon: <FileText className="w-4 h-4" />,
            onClick: (e) => console.log('Generate report', workOrder.work_order_id)
          }
        ]
      },
      {
        items: [
          {
            label: 'Archive work order',
            icon: <Archive className="w-4 h-4" />,
            onClick: (e) => console.log('Archive work order', workOrder.work_order_id),
            className: 'text-red-600'
          }
        ]
      }
    ];
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
                  <ActionMenu groups={getWorkOrderActions(workOrder)} />
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
