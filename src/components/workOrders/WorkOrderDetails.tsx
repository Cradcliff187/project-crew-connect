
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/ui/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, MapPin, User, Calendar, AlertCircle, DollarSign } from 'lucide-react';
import { WorkOrder } from '@/types/workOrder';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface WorkOrderDetailsProps {
  workOrder: WorkOrder;
  onStatusChange: () => void;
}

interface StatusTransition {
  to_status: string;
  label: string;
  description: string;
}

const WorkOrderDetails = ({ workOrder, onStatusChange }: WorkOrderDetailsProps) => {
  const [loading, setLoading] = useState(false);
  const [statusTransitions, setStatusTransitions] = useState<StatusTransition[]>([]);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [assigneeName, setAssigneeName] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        // Fetch possible status transitions
        const { data: transitionsData } = await supabase
          .rpc('get_next_possible_transitions', {
            entity_type_param: 'WORK_ORDER',
            current_status_param: workOrder.status
          });
        
        setStatusTransitions(transitionsData || []);
        
        // Fetch customer name if customer_id exists
        if (workOrder.customer_id) {
          const { data: customerData } = await supabase
            .from('customers')
            .select('customername')
            .eq('customerid', workOrder.customer_id)
            .single();
          
          setCustomerName(customerData?.customername || null);
        }
        
        // Fetch location name if location_id exists
        if (workOrder.location_id) {
          const { data: locationData } = await supabase
            .from('site_locations')
            .select('location_name, address, city, state, zip')
            .eq('location_id', workOrder.location_id)
            .single();
          
          if (locationData) {
            const addressParts = [
              locationData.location_name,
              locationData.address,
              `${locationData.city}, ${locationData.state} ${locationData.zip}`
            ].filter(Boolean);
            
            setLocationName(addressParts.join(' • '));
          }
        }
        
        // Fetch assignee name if assigned_to exists
        if (workOrder.assigned_to) {
          const { data: employeeData } = await supabase
            .from('employees')
            .select('first_name, last_name')
            .eq('employee_id', workOrder.assigned_to)
            .single();
          
          if (employeeData) {
            setAssigneeName(`${employeeData.first_name} ${employeeData.last_name}`);
          }
        }
      } catch (error) {
        console.error('Error fetching related data:', error);
      }
    };
    
    fetchRelatedData();
  }, [workOrder]);
  
  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('maintenance_work_orders')
        .update({ status: newStatus })
        .eq('work_order_id', workOrder.work_order_id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Status Updated',
        description: `Work order status changed to ${newStatus.replace('_', ' ').toLowerCase()}.`,
      });
      
      onStatusChange();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error Updating Status',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{workOrder.title}</h3>
          {workOrder.po_number && <p className="text-sm text-muted-foreground">PO #{workOrder.po_number}</p>}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <span className="mr-2">Status:</span>
            <StatusBadge status={workOrder.status} />
          </div>
          
          {statusTransitions.length > 0 && (
            <Select onValueChange={handleStatusChange} disabled={loading}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Change status" />
              </SelectTrigger>
              <SelectContent>
                {statusTransitions.map((transition) => (
                  <SelectItem key={transition.to_status} value={transition.to_status}>
                    {transition.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Priority</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {workOrder.priority?.toLowerCase() || 'Medium'}
                  </p>
                </div>
              </div>
              
              {workOrder.scheduled_date && (
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Scheduled Date</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(workOrder.scheduled_date)}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start">
                <Clock className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Time</p>
                  <p className="text-sm text-muted-foreground">
                    {workOrder.time_estimate ? `Estimated: ${workOrder.time_estimate} hours` : 'No estimate'} 
                    {workOrder.actual_hours ? ` • Actual: ${workOrder.actual_hours} hours` : ''}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <DollarSign className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Costs</p>
                  <p className="text-sm text-muted-foreground">
                    {workOrder.materials_cost ? `Materials: ${formatCurrency(workOrder.materials_cost)}` : 'No materials'} 
                    {workOrder.total_cost ? ` • Total: ${formatCurrency(workOrder.total_cost)}` : ''}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {customerName && (
                <div className="flex items-start">
                  <User className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Customer</p>
                    <p className="text-sm text-muted-foreground">{customerName}</p>
                  </div>
                </div>
              )}
              
              {locationName && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{locationName}</p>
                  </div>
                </div>
              )}
              
              {assigneeName && (
                <div className="flex items-start">
                  <User className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Assigned To</p>
                    <p className="text-sm text-muted-foreground">{assigneeName}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start">
                <Calendar className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">{formatDate(workOrder.created_at)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {workOrder.description && (
        <>
          <Separator />
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-sm whitespace-pre-wrap">{workOrder.description}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkOrderDetails;
