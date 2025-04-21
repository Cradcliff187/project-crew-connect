import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { WorkOrder } from '@/types/workOrder';
import {
  WorkOrderStatusControl,
  WorkOrderInfoCard,
  WorkOrderContactCard,
  WorkOrderDescription,
  WorkOrderProgressCard,
  WorkOrderCostSummary,
} from '.';
import WorkOrderDocuments from '../documents';
import WorkOrderTimelogs from '../WorkOrderTimelogs';
import WorkOrderExpenses from '../WorkOrderExpenses';
import WorkOrderMaterials from '../WorkOrderMaterials';
import ChangeOrdersList from '@/components/changeOrders/WorkOrderChangeOrdersList';

interface WorkOrderDetailContentProps {
  workOrder: WorkOrder;
  customer: { name: string; email: string; phone: string } | null;
  location: { name: string; address: string } | null;
  assignee: { name: string } | null;
  onStatusChange: () => void;
}

const WorkOrderDetailContent = ({
  workOrder,
  customer,
  location,
  assignee,
  onStatusChange,
}: WorkOrderDetailContentProps) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center">
        <div>
          <h3 className="text-lg font-semibold">{workOrder.title}</h3>
          {workOrder.po_number && (
            <p className="text-sm text-muted-foreground">PO #{workOrder.po_number}</p>
          )}
        </div>

        <WorkOrderStatusControl workOrder={workOrder} onStatusChange={onStatusChange} />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-6 mb-4">
          <TabsTrigger value="overview" className="text-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-sm">
            Documents
          </TabsTrigger>
          <TabsTrigger value="time" className="text-sm">
            Time Tracking
          </TabsTrigger>
          <TabsTrigger value="expenses" className="text-sm">
            Expenses
          </TabsTrigger>
          <TabsTrigger value="materials" className="text-sm">
            Materials
          </TabsTrigger>
          <TabsTrigger value="changes" className="text-sm">
            Change Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <WorkOrderInfoCard workOrder={workOrder} />
            <WorkOrderContactCard
              workOrder={workOrder}
              customer={customer}
              location={location}
              assignee={assignee}
            />
          </div>

          <Card>
            <CardContent className="pt-6">
              <WorkOrderDescription description={workOrder.description} />
              <WorkOrderProgressCard workOrder={workOrder} onProgressUpdate={onStatusChange} />
            </CardContent>
          </Card>

          <WorkOrderCostSummary workOrder={workOrder} />
        </TabsContent>

        <TabsContent value="documents">
          <WorkOrderDocuments workOrderId={workOrder.work_order_id} entityType="WORK_ORDER" />
        </TabsContent>

        <TabsContent value="time">
          <WorkOrderTimelogs
            workOrderId={workOrder.work_order_id}
            onTimeLogAdded={onStatusChange}
          />
        </TabsContent>

        <TabsContent value="expenses">
          <WorkOrderExpenses
            workOrderId={workOrder.work_order_id}
            onExpenseAdded={onStatusChange}
          />
        </TabsContent>

        <TabsContent value="materials">
          <WorkOrderMaterials
            workOrderId={workOrder.work_order_id}
            onMaterialAdded={onStatusChange}
          />
        </TabsContent>

        <TabsContent value="changes">
          <ChangeOrdersList
            workOrderId={workOrder.work_order_id}
            onChangeOrderAdded={onStatusChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkOrderDetailContent;
