import { useState } from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { WorkOrder } from '@/types/workOrder';
import WorkOrderRow from './components/WorkOrderRow';
import WorkOrderTableHeader from './components/WorkOrderTableHeader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface WorkOrdersTableProps {
  workOrders: WorkOrder[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  onStatusChange: () => void;
}

const WorkOrdersTable = ({
  workOrders,
  loading,
  error,
  searchQuery,
  onStatusChange,
}: WorkOrdersTableProps) => {
  const [expandedWorkOrderId, setExpandedWorkOrderId] = useState<string | null>(null);

  // Filter work orders by search query
  const filteredWorkOrders = workOrders.filter(workOrder => {
    const query = searchQuery.toLowerCase();

    // Search by work order number, PO number, title, and status
    return (
      (workOrder.work_order_number && workOrder.work_order_number.toLowerCase().includes(query)) ||
      (workOrder.po_number && workOrder.po_number.toLowerCase().includes(query)) ||
      workOrder.title.toLowerCase().includes(query) ||
      (workOrder.status && workOrder.status.toLowerCase().includes(query))
    );
  });

  // Handle error state
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load work orders: {error}</AlertDescription>
      </Alert>
    );
  }

  // Handle loading state
  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  // Empty state when no work orders found
  if (filteredWorkOrders.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-600">No work orders found</h3>
        <p className="text-sm text-gray-500 mt-2">
          {searchQuery
            ? 'Try changing your search query.'
            : 'Create a new work order to get started.'}
        </p>
      </div>
    );
  }

  return (
    <Table className="border rounded-md">
      <WorkOrderTableHeader />
      <TableBody>
        {filteredWorkOrders.map(workOrder => (
          <WorkOrderRow key={workOrder.work_order_id} workOrder={workOrder} />
        ))}
      </TableBody>
    </Table>
  );
};

export default WorkOrdersTable;
