
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ExternalLink, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface WorkOrder {
  work_order_id: string;
  title: string;
  status: string;
  created_at: string;
}

interface AssociatedWorkOrdersProps {
  workOrders: WorkOrder[];
  loading: boolean;
  showFullTable?: boolean;
}

const AssociatedWorkOrders = ({ workOrders, loading, showFullTable = false }: AssociatedWorkOrdersProps) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-[#0485ea]" />
        <p className="mt-2 text-sm text-muted-foreground">Loading work orders...</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-base font-medium mb-4">Associated Work Orders</h3>
      
      {workOrders.length === 0 ? (
        <p className="text-muted-foreground text-sm">No work orders associated with this subcontractor.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                {showFullTable && <TableHead>Created On</TableHead>}
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workOrders.slice(0, showFullTable ? undefined : 5).map((workOrder) => (
                <TableRow key={workOrder.work_order_id}>
                  <TableCell>{workOrder.title}</TableCell>
                  <TableCell>
                    <span className="capitalize">{workOrder.status?.toLowerCase() || 'Unknown'}</span>
                  </TableCell>
                  {showFullTable && <TableCell>{formatDate(workOrder.created_at)}</TableCell>}
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/work-orders/${workOrder.work_order_id}`}>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {!showFullTable && workOrders.length > 5 && (
            <div className="mt-2 text-right">
              <Button variant="link" size="sm" className="text-[#0485ea]">
                View all {workOrders.length} work orders
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssociatedWorkOrders;
