
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { WorkOrder } from '@/types/workOrder';
import { supabase } from '@/integrations/supabase/client';
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
  // State for related data
  const [customer, setCustomer] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);
  const [assignee, setAssignee] = useState<any>(null);
  
  // Fetch related data
  useEffect(() => {
    const fetchRelatedData = async () => {
      // Fetch customer if available
      if (workOrder.customer_id) {
        const { data: customerData } = await supabase
          .from('customers')
          .select('customername, contactemail, phone')
          .eq('customerid', workOrder.customer_id)
          .single();
          
        if (customerData) {
          setCustomer({
            name: customerData.customername,
            email: customerData.contactemail,
            phone: customerData.phone
          });
        }
      }
      
      // Fetch location if available
      if (workOrder.location_id) {
        const { data: locationData } = await supabase
          .from('site_locations')
          .select('location_name, address, city, state, zip')
          .eq('location_id', workOrder.location_id)
          .single();
          
        if (locationData) {
          setLocation({
            name: locationData.location_name,
            address: `${locationData.address}, ${locationData.city}, ${locationData.state} ${locationData.zip}`
          });
        }
      }
      
      // Fetch assignee if available
      if (workOrder.assigned_to) {
        const { data: employeeData } = await supabase
          .from('employees')
          .select('first_name, last_name')
          .eq('employee_id', workOrder.assigned_to)
          .single();
          
        if (employeeData) {
          setAssignee({
            name: `${employeeData.first_name} ${employeeData.last_name}`
          });
        }
      }
    };
    
    fetchRelatedData();
  }, [workOrder]);
  
  // Function to handle refreshing the work order data
  const handleRefresh = () => {
    console.log('Refreshing work order data');
    onStatusChange();
  };
  
  // State to manage active tab
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center">
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
