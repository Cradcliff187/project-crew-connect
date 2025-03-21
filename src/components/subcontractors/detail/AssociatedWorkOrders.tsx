
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Associated Work Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Loading work orders...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Associated Work Orders
        </CardTitle>
      </CardHeader>
      <CardContent>
        {workOrders.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Wrench className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>No work orders are associated with this subcontractor yet.</p>
          </div>
        ) : (
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
                {workOrders.map((workOrder) => (
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
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssociatedWorkOrders;
