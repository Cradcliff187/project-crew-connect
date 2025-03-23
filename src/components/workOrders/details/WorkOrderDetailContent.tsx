
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { WorkOrder } from '@/types/workOrder';
import {
  WorkOrderStatusControl,
  WorkOrderInfoCard,
  WorkOrderContactCard,
  WorkOrderDescription,
  WorkOrderProgressCard,
  WorkOrderCostSummary
} from '.';
import WorkOrderDocuments from '../documents';
import WorkOrderTimelogs from '../WorkOrderTimelogs';
import WorkOrderExpenses from '../WorkOrderExpenses';

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
  onStatusChange 
}: WorkOrderDetailContentProps) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center">
        <div>
          <h3 className="text-lg font-semibold">{workOrder.title}</h3>
          {workOrder.po_number && <p className="text-sm text-muted-foreground">PO #{workOrder.po_number}</p>}
        </div>
        
        <WorkOrderStatusControl workOrder={workOrder} onStatusChange={onStatusChange} />
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
          <TabsTrigger value="documents" className="text-sm">Documents</TabsTrigger>
          <TabsTrigger value="time" className="text-sm">Time Tracking</TabsTrigger>
          <TabsTrigger value="expenses" className="text-sm">Expenses</TabsTrigger>
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
              
              <div className="my-6 border-t pt-6">
                <WorkOrderProgressCard 
                  workOrder={workOrder} 
                  onProgressUpdate={onStatusChange} 
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="md:grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-base font-medium mb-4">Summary</h3>
                  <p className="text-sm text-muted-foreground">
                    This work order is currently <span className="font-medium">{workOrder.progress || 0}% complete</span>. 
                    {workOrder.status === 'completed' ? 
                      ' The work has been completed.' : 
                      workOrder.progress && workOrder.progress > 0 ? ' Work is in progress.' : ' Work has not started yet.'}
                  </p>
                  
                  {workOrder.scheduled_date && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Scheduled for completion by {new Date(workOrder.scheduled_date).toLocaleDateString()}.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
            <div>
              <WorkOrderCostSummary workOrder={workOrder} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="documents">
          <WorkOrderDocuments 
            workOrderId={workOrder.work_order_id} 
            entityType="WORK_ORDER"
          />
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
      </Tabs>
    </div>
  );
};

export default WorkOrderDetailContent;
