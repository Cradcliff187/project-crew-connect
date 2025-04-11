
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { formatDate, calculateDaysUntilDue } from '@/lib/utils';
import { Pencil, MessageSquare, CalendarClock, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { WorkOrder } from '@/types/workOrder';
import StatusBadge from '@/components/ui/StatusBadge';
import DueStatusBadge from './DueStatusBadge';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';

interface WorkOrderRowProps {
  workOrder: WorkOrder;
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
        {workOrder.po_number ? (
          <span className="text-gray-700">{workOrder.po_number}</span>
        ) : (
          <span className="text-gray-400 italic">No PO</span>
        )}
      </TableCell>
      <TableCell>{workOrder.due_by_date ? formatDate(workOrder.due_by_date) : '-'}</TableCell>
      <TableCell>
        <DueStatusBadge daysUntilDue={daysUntilDue} />
      </TableCell>
      <TableCell>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          workOrder.priority === 'HIGH' ? 'bg-red-100 text-red-800' : 
          workOrder.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 
          'bg-blue-100 text-blue-800'
        }`}>
          {workOrder.priority || 'MEDIUM'}
        </span>
      </TableCell>
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
