
import { useNavigate } from 'react-router-dom';
import { TableRow, TableCell } from "@/components/ui/table";
import { Calendar, Eye, Edit } from 'lucide-react';
import { WorkOrder } from '@/types/workOrder';
import { formatDate } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import ActionMenu from '@/components/ui/action-menu';

interface WorkOrderRowProps {
  workOrder: WorkOrder;
}

const WorkOrderRow = ({ workOrder }: WorkOrderRowProps) => {
  const navigate = useNavigate();

  const handleRowClick = () => {
    navigate(`/work-orders/${workOrder.work_order_id}`);
  };

  return (
    <TableRow 
      key={workOrder.work_order_id} 
      className="cursor-pointer hover:bg-[#0485ea]/5 transition-colors"
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
        {workOrder.priority ? (
          <div className="capitalize">{workOrder.priority.toLowerCase()}</div>
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
                    onClick: () => {
                      // Implementation for editing would go here
                      console.log(`Edit work order ${workOrder.work_order_id}`);
                    }
                  }
                ]
              }
            ]}
            size="sm"
          />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default WorkOrderRow;
