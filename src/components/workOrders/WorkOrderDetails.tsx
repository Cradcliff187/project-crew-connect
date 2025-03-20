
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
import WorkOrderTimelogs from './WorkOrderTimelogs';
import WorkOrderMaterials from './WorkOrderMaterials';

interface WorkOrderDetailsProps {
  workOrder: WorkOrder;
  onStatusChange: () => void;
}

const WorkOrderDetails = ({ workOrder, onStatusChange }: WorkOrderDetailsProps) => {
  const [activeTab, setActiveTab] = useState('details');
  const [showTimelogs, setShowTimelogs] = useState(false);
  
  // Function to handle refreshing the work order data
  const handleRefresh = () => {
    onStatusChange();
  };
  
  // Switch to time tab and possibly focus on the add form
  const handleAddTimeLog = () => {
    setActiveTab('costs');
    setShowTimelogs(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{workOrder.title}</h3>
          {workOrder.po_number && <p className="text-sm text-muted-foreground">PO #{workOrder.po_number}</p>}
        </div>
        
        <WorkOrderStatusControl workOrder={workOrder} onStatusChange={handleRefresh} />
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
            onProgressUpdate={handleRefresh} 
          />
        </TabsContent>
        
        <TabsContent value="documents">
          <WorkOrderDocumentsList workOrderId={workOrder.work_order_id} />
        </TabsContent>
        
        <TabsContent value="costs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              {showTimelogs ? (
                <WorkOrderTimelogs 
                  workOrderId={workOrder.work_order_id} 
                  onTimeLogAdded={handleRefresh}
                />
              ) : (
                <WorkOrderMaterials 
                  workOrderId={workOrder.work_order_id} 
                  onMaterialAdded={handleRefresh}
                />
              )}
            </div>
            <div>
              <WorkOrderCostSummary 
                workOrder={workOrder} 
                onAddTimeLog={() => setShowTimelogs(true)}
              />
            </div>
          </div>
          
          <div className="mt-6">
            <Tabs defaultValue={showTimelogs ? "time" : "materials"} onValueChange={(value) => setShowTimelogs(value === "time")}>
              <TabsList>
                <TabsTrigger value="materials">Materials</TabsTrigger>
                <TabsTrigger value="time">Time Tracking</TabsTrigger>
              </TabsList>
              
              <TabsContent value="materials" className="mt-6">
                <WorkOrderMaterials 
                  workOrderId={workOrder.work_order_id} 
                  onMaterialAdded={handleRefresh}
                />
              </TabsContent>
              
              <TabsContent value="time" className="mt-6">
                <WorkOrderTimelogs 
                  workOrderId={workOrder.work_order_id} 
                  onTimeLogAdded={handleRefresh}
                />
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkOrderDetails;
