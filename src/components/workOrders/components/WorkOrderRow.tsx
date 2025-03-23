
import { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { WorkOrder } from '@/types/workOrder';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, DollarSign, FileText, MoreHorizontal, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import TableCell from './TableCell';
import { Badge as StatusBadge } from '@/components/ui/badge';

const getPriorityColor = (priority: string) => {
  switch (priority?.toUpperCase()) {
    case 'HIGH':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    case 'MEDIUM':
      return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
    case 'LOW':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'COMPLETED':
      return 'bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-500/20';
    case 'IN_PROGRESS':
      return 'bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 border-blue-500/20';
    case 'ON_HOLD':
      return 'bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-amber-500/20';
    case 'CANCELLED':
      return 'bg-red-500/10 text-red-700 hover:bg-red-500/20 border-red-500/20';
    case 'NEW':
    default:
      return 'bg-gray-500/10 text-gray-700 hover:bg-gray-500/20 border-gray-500/20';
  }
};

interface WorkOrderRowProps {
  workOrder: WorkOrder;
  onStatusChange: () => void;
}

export const WorkOrderRow = ({ workOrder, onStatusChange }: WorkOrderRowProps) => {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState<string>('');
  const [assigneeName, setAssigneeName] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  
  // Fetch the customer name if customer_id is available
  useEffect(() => {
    const fetchCustomer = async () => {
      if (workOrder.customer_id) {
        const { data } = await supabase
          .from('customers')
          .select('customername')
          .eq('customerid', workOrder.customer_id)
          .single();
          
        if (data) {
          setCustomerName(data.customername);
        }
      }
    };
    
    fetchCustomer();
  }, [workOrder.customer_id]);
  
  // Fetch the assignee name if assigned_to is available
  useEffect(() => {
    const fetchAssignee = async () => {
      if (workOrder.assigned_to) {
        const { data } = await supabase
          .from('employees')
          .select('first_name, last_name')
          .eq('employee_id', workOrder.assigned_to)
          .single();
          
        if (data) {
          setAssigneeName(`${data.first_name} ${data.last_name}`);
        }
      }
    };
    
    fetchAssignee();
  }, [workOrder.assigned_to]);
  
  // Handle click on the row to navigate to detail page
  const handleRowClick = () => {
    navigate(`/work-orders/${workOrder.work_order_id}`);
  };
  
  // Handle close of the dialog
  const handleCloseDialog = () => {
    setIsOpen(false);
  };

  return (
    <tr 
      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
      onClick={handleRowClick}
    >
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span>{workOrder.title}</span>
          {workOrder.po_number && (
            <span className="text-xs text-muted-foreground">PO #{workOrder.po_number}</span>
          )}
        </div>
      </TableCell>
      
      <TableCell>
        <StatusBadge className={`${getStatusColor(workOrder.status)}`}>
          {workOrder.status === 'IN_PROGRESS' ? 'In Progress' : 
           workOrder.status === 'ON_HOLD' ? 'On Hold' : 
           workOrder.status === 'NEW' ? 'New' : 
           workOrder.status}
        </StatusBadge>
      </TableCell>
      
      <TableCell>
        {customerName || '-'}
      </TableCell>
      
      <TableCell>
        <Badge className={`${getPriorityColor(workOrder.priority)}`}>
          {workOrder.priority}
        </Badge>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center">
          <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
          <span className="text-sm">
            {workOrder.scheduled_date ? formatDate(workOrder.scheduled_date) : 'Not scheduled'}
          </span>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center">
          <User className="h-4 w-4 text-gray-400 mr-1" />
          <span className="text-sm">
            {assigneeName || 'Unassigned'}
          </span>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center">
          <Clock className="h-4 w-4 text-gray-400 mr-1" />
          <span className="text-sm">
            {workOrder.time_estimate ? `${workOrder.time_estimate} hrs` : '-'}
          </span>
        </div>
        <div className="flex items-center mt-1">
          <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
          <span className="text-sm">
            {formatCurrency(workOrder.total_cost)}
          </span>
        </div>
      </TableCell>
      
      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(`/work-orders/${workOrder.work_order_id}`)}>
              <FileText className="mr-2 h-4 w-4" />
              <span>View Details</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsOpen(true)}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </tr>
  );
};

export default WorkOrderRow;
