
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableRow, TableCell } from "@/components/ui/table";
import { Calendar, Eye, Edit, Flag } from 'lucide-react';
import { WorkOrder } from '@/types/workOrder';
import { formatDate, calculateDaysUntilDue } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import ActionMenu from '@/components/ui/action-menu';
import WorkOrderDialog from '../WorkOrderDialog';
import DueStatusBadge from './DueStatusBadge';

interface WorkOrderRowProps {
  workOrder: WorkOrder;
  onStatusChange?: () => void;
}

const WorkOrderRow = ({ workOrder, onStatusChange }: WorkOrderRowProps) => {
  const navigate = useNavigate();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const daysUntilDue = calculateDaysUntilDue(workOrder.due_by_date);

  const handleRowClick = () => {
    navigate(`/work-orders/${workOrder.work_order_id}`);
  };

  const handleEditSaved = () => {
    // Trigger refresh if onStatusChange prop exists
    if (onStatusChange) {
      onStatusChange();
    }
  };

  const getPriorityBadgeStyle = (priority: string) => {
    switch(priority?.toUpperCase()) {
      case 'LOW':
        return "bg-green-100 text-green-800 border border-green-200";
      case 'MEDIUM':
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case 'HIGH':
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case 'URGENT':
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  return (
    <>
      <TableRow 
        key={workOrder.work_order_id} 
        className="cursor-pointer hover:bg-[#0485ea]/5 transition-colors font-opensans"
        onClick={(e) => {
          // Don't navigate if clicking on the actions menu
          if ((e.target as HTMLElement).closest('.actions-menu')) return;
          handleRowClick();
        }}
      >
        <TableCell>
          <div className="font-medium text-[#0485ea]">
            {workOrder.work_order_number ? (
              workOrder.work_order_number
            ) : (
              <span className="text-muted-foreground italic">No WO</span>
            )}
          </div>
        </TableCell>
        <TableCell>
          <div>
            {workOrder.po_number ? (
              workOrder.po_number
            ) : (
              <span className="text-muted-foreground italic">No PO</span>
            )}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            {workOrder.due_by_date ? (
              formatDate(workOrder.due_by_date)
            ) : (
              <span className="text-muted-foreground">Not set</span>
            )}
          </div>
        </TableCell>
        <TableCell>
          <DueStatusBadge daysUntilDue={daysUntilDue} />
        </TableCell>
        <TableCell>
          {workOrder.priority ? (
            <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityBadgeStyle(workOrder.priority)}`}>
              <Flag className="h-3.5 w-3.5 mr-1.5" />
              <span className="capitalize">{workOrder.priority.toLowerCase()}</span>
            </div>
          ) : (
            <span className="text-muted-foreground italic">None</span>
          )}
        </TableCell>
        <TableCell>
          <StatusBadge status={workOrder.status} />
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end space-x-2 actions-menu" onClick={(e) => e.stopPropagation()}>
            <ActionMenu 
              groups={[
                {
                  items: [
                    {
                      label: "View Details",
                      icon: <Eye className="h-4 w-4" />,
                      onClick: () => navigate(`/work-orders/${workOrder.work_order_id}`)
                    },
                    {
                      label: "Edit Work Order",
                      icon: <Edit className="h-4 w-4" />,
                      onClick: () => setShowEditDialog(true)
                    }
                  ]
                }
              ]}
              size="sm"
            />
          </div>
        </TableCell>
      </TableRow>

      {/* Edit Work Order Dialog */}
      <WorkOrderDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        workOrder={workOrder}
        onWorkOrderSaved={handleEditSaved}
      />
    </>
  );
};

export default WorkOrderRow;
