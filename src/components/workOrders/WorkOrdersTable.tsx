
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
import PaginationControl from './components/PaginationControl';

interface WorkOrdersTableProps {
  workOrders: WorkOrder[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  onStatusChange: () => void;
}

const WorkOrdersTable = ({ workOrders, loading, error, searchQuery, onStatusChange }: WorkOrdersTableProps) => {
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const filteredWorkOrders = workOrders.filter(workOrder => {
    const searchRegex = new RegExp(searchQuery, 'i');
    const matchesSearch = searchRegex.test(workOrder.title) || 
                          (workOrder.work_order_number ? searchRegex.test(workOrder.work_order_number) : false);
    
    const matchesStatus = statusFilter === 'ALL' || workOrder.status === statusFilter.toLowerCase().replace('_', '-');
    
    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const totalItems = filteredWorkOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredWorkOrders.slice(startIndex, endIndex);

  const handleStatusFilterChange = (status: WorkOrderStatus) => {
    setStatusFilter(status);
    // Reset to first page when filter changes
    setCurrentPage(1);
    onStatusChange();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
      
      <Card className="shadow-sm border-[#0485ea]/10">
        <CardContent className="p-0">
          <Table>
            <WorkOrderTableHeader />
            
            <TableBody>
              {loading ? (
                <WorkOrdersTableSkeleton rows={5} />
              ) : currentItems.length === 0 ? (
                <EmptyWorkOrders />
              ) : (
                currentItems.map((workOrder) => (
                  <WorkOrderRow 
                    key={workOrder.work_order_id}
                    workOrder={workOrder}
                    onStatusChange={onStatusChange}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Only show pagination when we have work orders and not loading */}
      {!loading && filteredWorkOrders.length > 0 && (
        <div className="mt-4">
          <PaginationControl 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default WorkOrdersTable;
