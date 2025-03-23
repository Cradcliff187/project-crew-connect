import React from 'react';
import { Button } from '@/components/ui/button';
import { TableRow, TableCell } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { Pencil, MessageSquare, CalendarClock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WorkOrder } from '@/types/workOrder';
import StatusBadge from '@/components/ui/status-badge';

interface WorkOrderRowProps {
  workOrder: WorkOrder;
}

const WorkOrderRow: React.FC<WorkOrderRowProps> = ({ workOrder }) => {
  return (
    <TableRow key={workOrder.work_order_id} className="hover:bg-[#0485ea]/5 transition-colors">
      <TableCell className="font-medium">{workOrder.work_order_number || '-'}</TableCell>
      <TableCell>
        <Link to={`/work-orders/${workOrder.work_order_id}`} className="hover:underline">
          {workOrder.title}
        </Link>
      </TableCell>
      <TableCell>{formatDate(workOrder.created_at)}</TableCell>
      <TableCell>{workOrder.scheduled_date ? formatDate(workOrder.scheduled_date) : '-'}</TableCell>
      <TableCell>
        <StatusBadge status={workOrder.status} />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button size="icon" variant="outline" asChild>
            <Link to={`/work-orders/${workOrder.work_order_id}`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="icon" variant="outline">
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline">
            <CalendarClock className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default WorkOrderRow;
