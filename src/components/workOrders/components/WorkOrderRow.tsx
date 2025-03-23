
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { Pencil, MessageSquare, CalendarClock, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { WorkOrder } from '@/types/workOrder';
import StatusBadge from '@/components/ui/StatusBadge';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';

interface WorkOrderRowProps {
  workOrder: WorkOrder;
}

const WorkOrderRow: React.FC<WorkOrderRowProps> = ({ workOrder }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/work-orders/${workOrder.work_order_id}`);
  };

  const actionGroups: ActionGroup[] = [
    {
      items: [
        {
          label: "View Details",
          icon: <Eye className="h-4 w-4" />,
          onClick: handleViewDetails,
          className: "text-[#0485ea] hover:text-[#0375d1]"
        },
        {
          label: "Edit",
          icon: <Pencil className="h-4 w-4" />,
          onClick: handleViewDetails,
          className: "text-gray-600 hover:text-gray-800"
        }
      ]
    },
    {
      items: [
        {
          label: "Schedule",
          icon: <CalendarClock className="h-4 w-4" />,
          onClick: () => console.log("Schedule:", workOrder.work_order_id),
          className: "text-gray-600 hover:text-gray-800"
        },
        {
          label: "Messages",
          icon: <MessageSquare className="h-4 w-4" />,
          onClick: () => console.log("Messages:", workOrder.work_order_id),
          className: "text-gray-600 hover:text-gray-800"
        }
      ]
    }
  ];

  return (
    <TableRow key={workOrder.work_order_id} className="hover:bg-[#0485ea]/5 transition-colors">
      <TableCell className="font-medium">
        <Link to={`/work-orders/${workOrder.work_order_id}`} className="text-[#0485ea] hover:underline">
          {workOrder.work_order_number || '-'}
        </Link>
      </TableCell>
      <TableCell>
        <Link to={`/work-orders/${workOrder.work_order_id}`} className="hover:text-[#0485ea]">
          {workOrder.title}
        </Link>
      </TableCell>
      <TableCell>{formatDate(workOrder.created_at)}</TableCell>
      <TableCell>{workOrder.scheduled_date ? formatDate(workOrder.scheduled_date) : '-'}</TableCell>
      <TableCell>
        <StatusBadge status={workOrder.status} />
      </TableCell>
      <TableCell className="text-right">
        <ActionMenu 
          groups={actionGroups} 
          size="sm" 
          align="end"
          triggerClassName="ml-auto"
        />
      </TableCell>
    </TableRow>
  );
};

export default WorkOrderRow;
