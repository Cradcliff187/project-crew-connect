
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Calendar, DollarSign, Hash, MoreVertical } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import StatusBadge from '@/components/ui/StatusBadge';
import ActionMenu from '@/components/ui/action-menu';

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
              <TableHead>WO Number</TableHead>
              <TableHead>PO Number</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-8 w-24 rounded-full" /></TableCell>
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
              <TableHead>WO Number</TableHead>
              <TableHead>PO Number</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
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
                    <div className="font-medium text-[#0485ea] flex items-center">
                      {workOrder.work_order_number ? (
                        <>
                          <Hash className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                          {workOrder.work_order_number}
                        </>
                      ) : (
                        <span className="text-muted-foreground italic">No WO #</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {workOrder.po_number ? (
                        <>
                          <DollarSign className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                          {workOrder.po_number}
                        </>
                      ) : (
                        <span className="text-muted-foreground italic">No PO #</span>
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
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default WorkOrdersTable;
