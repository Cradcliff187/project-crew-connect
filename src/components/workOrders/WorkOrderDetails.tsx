
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
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

interface WorkOrderDetailsProps {
  workOrder: WorkOrder;
  onStatusChange: () => void;
}

const WorkOrderDetails = ({ workOrder, onStatusChange }: WorkOrderDetailsProps) => {
  const [activeTab, setActiveTab] = useState('details');
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{workOrder.title}</h3>
          {workOrder.po_number && <p className="text-sm text-muted-foreground">PO #{workOrder.po_number}</p>}
        </div>
        
        <WorkOrderStatusControl workOrder={workOrder} onStatusChange={onStatusChange} />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="costs">Costs & Time</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <WorkOrderInfoCard workOrder={workOrder} />
            <WorkOrderContactCard workOrder={workOrder} />
          </div>
          
          <WorkOrderDescription description={workOrder.description} />
          
          <WorkOrderProgressCard 
            workOrder={workOrder} 
            onProgressUpdate={onStatusChange} 
          />
        </TabsContent>
        
        <TabsContent value="documents">
          <WorkOrderDocumentsList workOrderId={workOrder.work_order_id} />
        </TabsContent>
        
        <TabsContent value="costs">
          <WorkOrderCostSummary workOrder={workOrder} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkOrderDetails;
