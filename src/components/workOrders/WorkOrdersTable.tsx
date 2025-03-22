
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { WorkOrder } from '@/types/workOrder';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, Circle, AlertCircle, Calendar, Clock, DollarSign, Hash, ChevronRight } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusType } from '@/types/common';

type WorkOrderStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED' | 'ALL';
type BadgeVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'earth' | 'sage';

interface WorkOrdersTableProps {
  workOrders: WorkOrder[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  onStatusChange: () => void;
}

const WorkOrdersTable = ({ workOrders, loading, error, searchQuery, onStatusChange }: WorkOrdersTableProps) => {
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus>('ALL');
  
  const filteredWorkOrders = workOrders.filter(workOrder => {
    const searchRegex = new RegExp(searchQuery, 'i');
    const matchesSearch = searchRegex.test(workOrder.title) || (workOrder.work_order_number ? searchRegex.test(workOrder.work_order_number) : false);
    
    const matchesStatus = statusFilter === 'ALL' || workOrder.status === statusFilter.toLowerCase().replace('_', '-');
    
    return matchesSearch && matchesStatus;
  });

  const StatusBadge = ({ status }: { status: StatusType }) => {
    let badgeText = status.replace(/_/g, ' ').replace(/-/g, ' ');
    badgeText = badgeText.charAt(0).toUpperCase() + badgeText.slice(1).toLowerCase();
  
    let badgeVariant: BadgeVariant = "default";
  
    // Map status to appropriate badge variant
    switch (status) {
      case "not_started":
      case "not-started": 
        badgeVariant = "secondary";
        break;
      case "in_progress":
      case "in-progress":
        badgeVariant = "secondary";
        break;
      case "on_hold":
      case "on-hold":
        badgeVariant = "outline";
        break;
      case "completed":
        badgeVariant = "default";
        break;
      case "cancelled":
        badgeVariant = "destructive";
        break;
      default:
        badgeVariant = "outline";
        break;
    }
  
    return (
      <Badge variant={badgeVariant}>
        {badgeText}
      </Badge>
    );
  };

  const renderWorkOrderCards = (workOrders: WorkOrder[]) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {workOrders.map((workOrder) => (
          <Card key={workOrder.work_order_id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold truncate">
                  {workOrder.title}
                </CardTitle>
                <StatusBadge status={workOrder.status} />
              </div>
              <CardDescription>
                {workOrder.work_order_number && (
                  <span className="inline-flex items-center text-xs text-gray-500">
                    <Hash className="h-3 w-3 mr-1" /> {workOrder.work_order_number}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Created</p>
                  <p>{formatDate(workOrder.created_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Scheduled</p>
                  <p>{workOrder.scheduled_date ? formatDate(workOrder.scheduled_date) : "Not set"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Time</p>
                  <p>{workOrder.time_estimate || 0} hrs</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Cost</p>
                  <p>{workOrder.expenses_cost ? formatCurrency(workOrder.expenses_cost) : "$0.00"}</p>
                </div>
              </div>
              {workOrder.description && (
                <div className="mt-4">
                  <p className="text-muted-foreground text-xs">Description</p>
                  <p className="text-sm line-clamp-2">{workOrder.description}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-2">
              <Link 
                to={`/work-orders/${workOrder.work_order_id}`}
                className="text-[#0485ea] hover:text-[#0375d1] text-sm font-medium"
              >
                View Details
                <ChevronRight className="ml-1 h-4 w-4 inline" />
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto">
      {/* Status Filter */}
      <div className="mb-4 flex items-center space-x-2">
        <Label htmlFor="status">Filter by Status:</Label>
        <Select onValueChange={(value) => setStatusFilter(value as WorkOrderStatus)}>
          <SelectTrigger id="status">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="NOT_STARTED">Not Started</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="ON_HOLD">On Hold</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Error and Loading States */}
      {loading && <p>Loading work orders...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      
      {/* Work Order Cards */}
      {workOrders.length > 0 ? (
        renderWorkOrderCards(filteredWorkOrders)
      ) : (
        <div className="flex items-center justify-center h-48 text-gray-500">
          No work orders found.
        </div>
      )}
    </div>
  );
};

export default WorkOrdersTable;
