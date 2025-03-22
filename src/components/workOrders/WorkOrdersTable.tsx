
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
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
import { CheckCircle, Circle, AlertCircle, Calendar, Clock, DollarSign, Hash, ChevronRight, Eye, Edit, MoreVertical } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusType } from '@/types/common';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import StatusBadge from '@/components/ui/StatusBadge';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';

type WorkOrderStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED' | 'ALL';

interface WorkOrdersTableProps {
  workOrders: WorkOrder[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  onStatusChange: () => void;
}

const WorkOrdersTable = ({ workOrders, loading, error, searchQuery, onStatusChange }: WorkOrdersTableProps) => {
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus>('ALL');
  const navigate = useNavigate();
  
  const filteredWorkOrders = workOrders.filter(workOrder => {
    const searchRegex = new RegExp(searchQuery, 'i');
    const matchesSearch = searchRegex.test(workOrder.title) || (workOrder.work_order_number ? searchRegex.test(workOrder.work_order_number) : false);
    
    const matchesStatus = statusFilter === 'ALL' || workOrder.status === statusFilter.toLowerCase().replace('_', '-');
    
    return matchesSearch && matchesStatus;
  });

  const handleRowClick = (workOrderId: string) => {
    navigate(`/work-orders/${workOrderId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto">
        <div className="mb-4 flex items-center space-x-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-48" />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Work Order</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                <TableCell><Skeleton className="h-5 w-64" /></TableCell>
                <TableCell><Skeleton className="h-8 w-24 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-9 w-20 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading work orders</h3>
          <p className="text-red-600">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      {/* Status Filter */}
      <div className="mb-4 flex items-center space-x-2">
        <Select 
          onValueChange={(value) => setStatusFilter(value as WorkOrderStatus)}
          defaultValue="ALL"
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
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
      
      <Card className="border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Work Order</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWorkOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No work orders found that match your criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredWorkOrders.map((workOrder) => (
                <TableRow 
                  key={workOrder.work_order_id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={(e) => {
                    // Don't navigate if clicking on the actions menu
                    if ((e.target as HTMLElement).closest('.actions-menu')) return;
                    handleRowClick(workOrder.work_order_id);
                  }}
                >
                  <TableCell>
                    <div className="font-medium text-[#0485ea]">{workOrder.title}</div>
                    {workOrder.work_order_number && (
                      <div className="text-sm text-muted-foreground">
                        #{workOrder.work_order_number}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {workOrder.description ? (
                        <span className="line-clamp-2">{workOrder.description}</span>
                      ) : (
                        <span className="text-muted-foreground italic">No description</span>
                      )}
                    </div>
                    <div className="flex items-center mt-1 text-xs text-muted-foreground">
                      {workOrder.po_number && (
                        <div className="flex items-center mr-3">
                          <Hash className="h-3 w-3 mr-1" />
                          PO #{workOrder.po_number}
                        </div>
                      )}
                      {workOrder.total_cost !== undefined && workOrder.total_cost > 0 && (
                        <div className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {formatCurrency(workOrder.total_cost)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={workOrder.status} />
                    {workOrder.priority && (
                      <div className="text-xs mt-1 capitalize">
                        {workOrder.priority.toLowerCase()} priority
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                      {workOrder.scheduled_date ? (
                        formatDate(workOrder.scheduled_date)
                      ) : (
                        <span className="text-muted-foreground">Not scheduled</span>
                      )}
                    </div>
                    {workOrder.time_estimate && (
                      <div className="flex items-center text-xs mt-1 text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {workOrder.time_estimate} hrs estimated
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="w-full bg-muted rounded-full h-2.5 dark:bg-gray-200">
                      <div 
                        className="bg-[#0485ea] h-2.5 rounded-full" 
                        style={{ width: `${workOrder.progress || 0}%` }}
                      ></div>
                    </div>
                    <div className="text-xs mt-1 text-right">
                      {workOrder.progress || 0}% complete
                    </div>
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
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default WorkOrdersTable;
