
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/ui/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, MapPin, User, Calendar, AlertCircle, DollarSign, FileText, Package } from 'lucide-react';
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

interface CustomerDetails {
  customername: string;
  contactemail: string | null;
  phone: string | null;
}

interface LocationDetails {
  location_name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
}

interface EmployeeDetails {
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
}

const WorkOrderDetails = ({ workOrder, onStatusChange }: WorkOrderDetailsProps) => {
  const [loading, setLoading] = useState(false);
  const [statusTransitions, setStatusTransitions] = useState<StatusTransition[]>([]);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const [locationDetails, setLocationDetails] = useState<LocationDetails | null>(null);
  const [assigneeDetails, setAssigneeDetails] = useState<EmployeeDetails | null>(null);
  const [relatedDocumentCount, setRelatedDocumentCount] = useState(0);
  
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
        
        // Fetch customer details if customer_id exists
        if (workOrder.customer_id) {
          const { data: customerData, error: customerError } = await supabase
            .from('customers')
            .select('customername, contactemail, phone')
            .eq('customerid', workOrder.customer_id)
            .single();
          
          if (customerError) {
            console.error('Error fetching customer details:', customerError);
          } else {
            setCustomerDetails(customerData);
          }
        }
        
        // Fetch location details if location_id exists
        if (workOrder.location_id) {
          const { data: locationData, error: locationError } = await supabase
            .from('site_locations')
            .select('location_name, address, city, state, zip')
            .eq('location_id', workOrder.location_id)
            .single();
          
          if (locationError) {
            console.error('Error fetching location details:', locationError);
          } else {
            setLocationDetails(locationData);
          }
        }
        
        // Fetch assignee details if assigned_to exists
        if (workOrder.assigned_to) {
          const { data: employeeData, error: employeeError } = await supabase
            .from('employees')
            .select('first_name, last_name, phone, email')
            .eq('employee_id', workOrder.assigned_to)
            .single();
          
          if (employeeError) {
            console.error('Error fetching employee details:', employeeError);
          } else {
            setAssigneeDetails(employeeData);
          }
        }
        
        // Count related documents
        const { count, error: docError } = await supabase
          .from('documents')
          .select('document_id', { count: 'exact', head: true })
          .eq('entity_id', workOrder.work_order_id)
          .eq('entity_type', 'WORK_ORDER');
          
        if (docError) {
          console.error('Error counting documents:', docError);
        } else {
          setRelatedDocumentCount(count || 0);
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
      
      // Log the activity
      await supabase.from('activitylog').insert({
        action: 'Status Change',
        moduletype: 'WORK_ORDER',
        referenceid: workOrder.work_order_id,
        status: newStatus,
        previousstatus: workOrder.status,
        detailsjson: JSON.stringify({
          title: workOrder.title,
          from: workOrder.status,
          to: newStatus
        })
      });
      
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
  
  // Format the location details for display
  const getFormattedLocation = () => {
    if (!locationDetails) return 'No location assigned';
    
    const parts = [
      locationDetails.location_name,
      locationDetails.address,
      locationDetails.city && locationDetails.state ? 
        `${locationDetails.city}, ${locationDetails.state} ${locationDetails.zip || ''}`.trim() : 
        null
    ].filter(Boolean);
    
    return parts.join(' • ') || 'No address details';
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
              
              <div className="flex items-start">
                <FileText className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Documents</p>
                  <p className="text-sm text-muted-foreground">
                    {relatedDocumentCount > 0 ? `${relatedDocumentCount} document${relatedDocumentCount !== 1 ? 's' : ''}` : 'No documents attached'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {customerDetails && (
                <div className="flex items-start">
                  <User className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Customer</p>
                    <p className="text-sm text-muted-foreground">{customerDetails.customername}</p>
                    {customerDetails.contactemail && (
                      <p className="text-xs text-muted-foreground">{customerDetails.contactemail}</p>
                    )}
                    {customerDetails.phone && (
                      <p className="text-xs text-muted-foreground">{customerDetails.phone}</p>
                    )}
                  </div>
                </div>
              )}
              
              {locationDetails && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{getFormattedLocation()}</p>
                  </div>
                </div>
              )}
              
              {assigneeDetails && (
                <div className="flex items-start">
                  <User className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Assigned To</p>
                    <p className="text-sm text-muted-foreground">
                      {`${assigneeDetails.first_name} ${assigneeDetails.last_name}`}
                    </p>
                    {(assigneeDetails.email || assigneeDetails.phone) && (
                      <p className="text-xs text-muted-foreground">
                        {assigneeDetails.email || assigneeDetails.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex items-start">
                <Calendar className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">{formatDate(workOrder.created_at)}</p>
                  {workOrder.completed_date && (
                    <p className="text-xs text-muted-foreground">
                      Completed: {formatDate(workOrder.completed_date)}
                    </p>
                  )}
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
