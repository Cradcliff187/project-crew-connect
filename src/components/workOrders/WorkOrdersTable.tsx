
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { WorkOrder } from '@/types/workOrder';
import StatusFilter, { WorkOrderStatus } from './components/StatusFilter';
import WorkOrderTableHeader from './components/WorkOrderTableHeader';
import WorkOrderRow from './components/WorkOrderRow';
import WorkOrdersTableSkeleton from './components/WorkOrdersTableSkeleton';
import EmptyWorkOrders from './components/EmptyWorkOrders';
import WorkOrderError from './components/WorkOrderError';

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
    const matchesSearch = searchRegex.test(workOrder.title) || 
                          (workOrder.work_order_number ? searchRegex.test(workOrder.work_order_number) : false);
    
    const matchesStatus = statusFilter === 'ALL' || workOrder.status === statusFilter.toLowerCase().replace('_', '-');
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusFilterChange = (status: WorkOrderStatus) => {
    setStatusFilter(status);
    onStatusChange();
  };

  if (error) {
    return <WorkOrderError error={error} />;
  }

  return (
    <div className="container mx-auto">
      {/* Status Filter */}
      <div className="mb-4 flex items-center space-x-2">
        <StatusFilter onStatusChange={handleStatusFilterChange} defaultValue="ALL" />
      </div>
      
      <Card className="border shadow-sm">
        <Table>
          <WorkOrderTableHeader />
          
          <TableBody>
            {loading ? (
              <WorkOrdersTableSkeleton rows={5} />
            ) : filteredWorkOrders.length === 0 ? (
              <EmptyWorkOrders />
            ) : (
              filteredWorkOrders.map((workOrder) => (
                <WorkOrderRow 
                  key={workOrder.work_order_id}
                  workOrder={workOrder}
                />
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default WorkOrdersTable;
