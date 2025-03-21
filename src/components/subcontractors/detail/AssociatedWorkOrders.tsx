
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/components/subcontractors/utils/formatUtils';

interface AssociatedWorkOrdersProps {
  workOrders: any[];
  loading: boolean;
}

const AssociatedWorkOrders: React.FC<AssociatedWorkOrdersProps> = ({ workOrders, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Associated Work Orders</h3>
        <div className="text-muted-foreground">Loading work orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Associated Work Orders</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Work Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Labor Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Wrench className="h-8 w-8 opacity-40" />
                    <p>No work orders found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              workOrders.map((workOrder) => (
                <TableRow key={workOrder.work_order_id}>
                  <TableCell className="font-medium">{workOrder.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {workOrder.status?.toLowerCase() || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(workOrder.created_at)}</TableCell>
                  <TableCell>${workOrder.labor_cost || '0.00'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AssociatedWorkOrders;
