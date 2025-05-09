import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { formatDate, calculateDaysUntilDue, formatCurrency } from '@/lib/utils';
import { Pencil, MessageSquare, CalendarClock, Eye, DollarSign } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { WorkOrder } from '@/types/workOrder';
import StatusBadge from '@/components/common/status/StatusBadge';
import RSVPBadge from '@/components/common/status/RSVPBadge';
import DueStatusBadge from './DueStatusBadge';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';
import PriorityBadge from '@/components/common/status/PriorityBadge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { RSVPStatus } from '@/components/common/status/RSVPBadge';

interface WorkOrderRowProps {
  workOrder: WorkOrder & {
    calendar_status?: RSVPStatus | null;
    assignee_cost?: number | null;
  };
}

const WorkOrderRow: React.FC<WorkOrderRowProps> = ({ workOrder }) => {
  const navigate = useNavigate();
  const daysUntilDue = calculateDaysUntilDue(workOrder.due_by_date);

  const handleViewDetails = () => {
    navigate(`/work-orders/${workOrder.work_order_id}`);
  };

  const actionGroups: ActionGroup[] = [
    {
      items: [
        {
          label: 'View Details',
          icon: <Eye className="h-4 w-4" />,
          onClick: handleViewDetails,
          className: 'text-primary hover:text-primary/80',
        },
        {
          label: 'Edit',
          icon: <Pencil className="h-4 w-4" />,
          onClick: handleViewDetails,
          className: 'text-gray-600 hover:text-gray-800',
        },
      ],
    },
    {
      items: [
        {
          label: 'Schedule',
          icon: <CalendarClock className="h-4 w-4" />,
          onClick: () => console.log('Schedule:', workOrder.work_order_id),
          className: 'text-gray-600 hover:text-gray-800',
        },
        {
          label: 'Messages',
          icon: <MessageSquare className="h-4 w-4" />,
          onClick: () => console.log('Messages:', workOrder.work_order_id),
          className: 'text-gray-600 hover:text-gray-800',
        },
      ],
    },
  ];

  // Mock RSVP status for demo purposes - replace with actual data in production
  const calendarStatus =
    workOrder.calendar_status ||
    ((Math.random() > 0.7
      ? 'accepted'
      : Math.random() > 0.5
        ? 'tentative'
        : Math.random() > 0.3
          ? 'needsAction'
          : 'declined') as RSVPStatus);

  // Mock assignment cost - replace with actual data in production
  const assigneeCost = workOrder.assignee_cost ?? Math.round(Math.random() * 1200);

  return (
    <TableRow
      key={workOrder.work_order_id}
      className="hover:bg-primary/5 transition-colors cursor-pointer"
      onClick={handleViewDetails}
    >
      <TableCell className="font-medium">
        <Link
          to={`/work-orders/${workOrder.work_order_id}`}
          className="text-primary hover:underline"
          onClick={e => e.stopPropagation()}
        >
          {workOrder.work_order_number || '-'}
        </Link>
      </TableCell>
      <TableCell>
        {workOrder.po_number ? (
          <span className="text-gray-700">{workOrder.po_number}</span>
        ) : (
          <span className="text-gray-400 italic">No PO</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <div>{workOrder.due_by_date ? formatDate(workOrder.due_by_date) : '-'}</div>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-block mt-1">
                <RSVPBadge status={calendarStatus} size="sm" />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Calendar RSVP Status</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TableCell>
      <TableCell>
        <DueStatusBadge daysUntilDue={daysUntilDue} />
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <div>{formatCurrency(workOrder.total_cost)}</div>
          <div className="flex items-center mt-1">
            <DollarSign className="h-3 w-3 text-emerald-600 mr-1" />
            <span className="text-xs text-emerald-600">{formatCurrency(assigneeCost)}</span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <PriorityBadge priority={workOrder.priority} />
      </TableCell>
      <TableCell>
        <StatusBadge status={workOrder.status} />
      </TableCell>
      <TableCell className="text-right" onClick={e => e.stopPropagation()}>
        <ActionMenu groups={actionGroups} size="sm" align="end" triggerClassName="ml-auto" />
      </TableCell>
    </TableRow>
  );
};

export default WorkOrderRow;
