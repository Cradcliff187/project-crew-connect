
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { WorkOrder } from '@/types/workOrder';
import {
  WorkOrderStatusControl,
  WorkOrderInfoCard,
  WorkOrderContactCard,
  WorkOrderDescription,
  WorkOrderDocumentsList,
  WorkOrderCostSummary,
  WorkOrderProgressCard
} from './details';
import WorkOrderTimelogs from './WorkOrderTimelogs';
import WorkOrderExpenses from './WorkOrderExpenses';

interface WorkOrderDetailsProps {
  workOrder: WorkOrder;
  onStatusChange: () => void;
}

const WorkOrderDetails = ({ workOrder, onStatusChange }: WorkOrderDetailsProps) => {
  // Function to handle refreshing the work order data
  const handleRefresh = () => {
    onStatusChange();
  };
  
  // State to manage active tab
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{workOrder.title}</h3>
          {workOrder.po_number && <p className="text-sm text-muted-foreground">PO #{workOrder.po_number}</p>}
        </div>
        
        <WorkOrderStatusControl workOrder={workOrder} onStatusChange={handleRefresh} />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
          <TabsTrigger value="documents" className="text-sm">Documents</TabsTrigger>
          <TabsTrigger value="time" className="text-sm">Time Tracking</TabsTrigger>
          <TabsTrigger value="expenses" className="text-sm">Expenses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <WorkOrderInfoCard workOrder={workOrder} />
            <WorkOrderContactCard workOrder={workOrder} />
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <WorkOrderDescription description={workOrder.description} />
              
              <Separator className="my-4" />
              
              <WorkOrderProgressCard 
                workOrder={workOrder} 
                onProgressUpdate={handleRefresh} 
              />
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
          <WorkOrderDocumentsList workOrderId={workOrder.work_order_id} />
        </TabsContent>
        
        <TabsContent value="time">
          <WorkOrderTimelogs 
            workOrderId={workOrder.work_order_id} 
            onTimeLogAdded={handleRefresh}
          />
        </TabsContent>
        
        <TabsContent value="expenses">
          <WorkOrderExpenses 
            workOrderId={workOrder.work_order_id} 
            onExpenseAdded={handleRefresh}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkOrderDetails;
