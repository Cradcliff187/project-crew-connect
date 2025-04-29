import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Wrench,
  Eye,
  Edit,
  Clock,
  FileText,
  Archive,
  CalendarClock,
  Plus,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import StatusBadge from '@/components/common/status/StatusBadge';
import { WorkItem } from '@/types/activeWork';
import { formatDate, formatCurrency } from '@/lib/utils';
import WorkOrderDetailDialog from '@/components/workOrders/WorkOrderDetailDialog';
import { WorkOrder } from '@/types/workOrder';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';

interface ActiveWorkTableProps {
  items: WorkItem[];
  loading: boolean;
  projectsError: string | null;
  workOrdersError: string | null;
  onWorkOrderChange: () => void;
}

const ActiveWorkTable = ({
  items,
  loading,
  projectsError,
  workOrdersError,
  onWorkOrderChange,
}: ActiveWorkTableProps) => {
  const navigate = useNavigate();
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  if (loading) {
    return (
      <div
        className="rounded-lg border border-border bg-card shadow-sm overflow-hidden animate-in"
        style={{ animationDelay: '0.2s' }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Name/Title</TableHead>
              <TableHead>Client/Customer</TableHead>
              <TableHead>Reference/PO#</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                <TableCell>
                  <Skeleton className="h-6 w-6 rounded-full" />
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-3 w-[80px]" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[150px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-2 w-[100px]" />
                    <Skeleton className="h-4 w-[30px]" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-[80px] rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (projectsError && workOrdersError) {
    return (
      <div
        className="rounded-lg border border-border bg-card shadow-sm overflow-hidden animate-in"
        style={{ animationDelay: '0.2s' }}
      >
        <div className="text-center py-10 text-red-500">
          <p>Error loading data:</p>
          <p>{projectsError}</p>
          <p>{workOrdersError}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        className="rounded-lg border border-border bg-card shadow-sm overflow-hidden animate-in"
        style={{ animationDelay: '0.2s' }}
      >
        <div className="text-center py-10 text-muted-foreground">
          <div className="flex justify-center mb-3">
            <Briefcase className="h-8 w-8 mr-2 opacity-50" />
            <Wrench className="h-8 w-8 opacity-50" />
          </div>
          <p>No active work items found. Check your filters or search query.</p>
        </div>
      </div>
    );
  }

  const handleViewDetails = (item: WorkItem) => {
    if (item.type === 'project') {
      navigate(`/projects/${item.id}`);
    } else {
      const originalWorkOrder = items
        .filter(i => i.type === 'workOrder')
        .find(i => i.id === item.id);

      if (originalWorkOrder) {
        const workOrder: any = {
          work_order_id: originalWorkOrder.id,
          title: originalWorkOrder.title,
          description: originalWorkOrder.description,
          status: originalWorkOrder.status,
          priority: originalWorkOrder.priority,
          scheduled_date: originalWorkOrder.dueDate,
          customer_id: originalWorkOrder.customerId,
          location_id: originalWorkOrder.location,
          created_at: originalWorkOrder.createdAt,
          po_number: originalWorkOrder.poNumber,
          assigned_to: originalWorkOrder.assignedTo,
          progress: originalWorkOrder.progress,
        };

        setSelectedWorkOrder(workOrder as WorkOrder);
        setDetailOpen(true);
      }
    }
  };

  const getItemActions = (item: WorkItem): ActionGroup[] => {
    if (item.type === 'project') {
      return [
        {
          items: [
            {
              label: 'View details',
              icon: <Eye className="w-4 h-4" />,
              onClick: e => handleViewDetails(item),
            },
            {
              label: 'Edit project',
              icon: <Edit className="w-4 h-4" />,
              onClick: e => navigate(`/projects/${item.id}/edit`),
            },
          ],
        },
        {
          items: [
            {
              label: 'Add time log',
              icon: <Clock className="w-4 h-4" />,
              onClick: e => console.log('Add time log to project', item.id),
            },
            {
              label: 'Add document',
              icon: <FileText className="w-4 h-4" />,
              onClick: e => console.log('Add document to project', item.id),
            },
          ],
        },
        {
          items: [
            {
              label: 'Update status',
              icon: <Edit className="w-4 h-4" />,
              onClick: e => console.log('Update project status', item.id),
            },
            {
              label: 'Update progress',
              icon: <Edit className="w-4 h-4" />,
              onClick: e => console.log('Update project progress', item.id),
            },
          ],
        },
        {
          items: [
            {
              label: 'Archive project',
              icon: <Archive className="w-4 h-4" />,
              onClick: e => console.log('Archive project', item.id),
              className: 'text-red-600',
            },
          ],
        },
      ];
    } else {
      return [
        {
          items: [
            {
              label: 'View details',
              icon: <Eye className="w-4 h-4" />,
              onClick: e => handleViewDetails(item),
            },
            {
              label: 'Edit work order',
              icon: <Edit className="w-4 h-4" />,
              onClick: e => console.log('Edit work order', item.id),
            },
          ],
        },
        {
          items: [
            {
              label: 'Add time log',
              icon: <Clock className="w-4 h-4" />,
              onClick: e => console.log('Add time log to work order', item.id),
            },
            {
              label: 'Add document',
              icon: <FileText className="w-4 h-4" />,
              onClick: e => console.log('Add document to work order', item.id),
            },
          ],
        },
        {
          items: [
            {
              label: 'Update status',
              icon: <Edit className="w-4 h-4" />,
              onClick: e => console.log('Update work order status', item.id),
            },
            {
              label: 'Update progress',
              icon: <Edit className="w-4 h-4" />,
              onClick: e => console.log('Update work order progress', item.id),
            },
          ],
        },
        {
          items: [
            {
              label: 'Archive work order',
              icon: <Archive className="w-4 h-4" />,
              onClick: e => console.log('Archive work order', item.id),
              className: 'text-red-600',
            },
          ],
        },
      ];
    }
  };

  return (
    <div className="premium-card animate-in" style={{ animationDelay: '0.2s' }}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Name/Title</TableHead>
            <TableHead>Client/Customer</TableHead>
            <TableHead>Reference/PO#</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => (
            <TableRow
              key={`${item.type}-${item.id}`}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleViewDetails(item)}
            >
              <TableCell>
                {item.type === 'project' ? (
                  <Briefcase className="h-5 w-5 text-[#0485ea]" />
                ) : (
                  <Wrench className="h-5 w-5 text-[#0485ea]" />
                )}
              </TableCell>
              <TableCell>
                <div className="font-medium text-[#0485ea]">{item.title}</div>
                <div className="text-xs text-muted-foreground">
                  {item.type === 'project' ? 'Project' : 'Work Order'}
                </div>
              </TableCell>
              <TableCell>{item.customerName || 'No Client'}</TableCell>
              <TableCell>
                {item.type === 'project' ? (
                  <span className="text-sm">{item.id}</span>
                ) : (
                  <>
                    <div className="text-sm">{item.id}</div>
                    {item.poNumber && (
                      <div className="text-xs text-muted-foreground">PO #{item.poNumber}</div>
                    )}
                  </>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Progress value={item.progress || 0} className="h-2 w-[100px]" />
                  <span className="text-sm text-muted-foreground">{item.progress || 0}%</span>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={item.status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarClock className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                  {formatDate(item.createdAt)}
                </div>
              </TableCell>
              <TableCell onClick={e => e.stopPropagation()}>
                <ActionMenu groups={getItemActions(item)} size="sm" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedWorkOrder && (
        <WorkOrderDetailDialog
          workOrder={selectedWorkOrder}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onStatusChange={onWorkOrderChange}
        />
      )}
    </div>
  );
};

export default ActiveWorkTable;
