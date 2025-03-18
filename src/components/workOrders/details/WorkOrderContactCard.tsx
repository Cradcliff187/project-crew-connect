
import { useState, useEffect } from 'react';
import { User, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder';
import { formatDate } from '@/lib/utils';

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

interface WorkOrderContactCardProps {
  workOrder: WorkOrder;
}

const WorkOrderContactCard = ({ workOrder }: WorkOrderContactCardProps) => {
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const [locationDetails, setLocationDetails] = useState<LocationDetails | null>(null);
  const [assigneeDetails, setAssigneeDetails] = useState<EmployeeDetails | null>(null);
  
  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
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
      } catch (error) {
        console.error('Error fetching related data:', error);
      }
    };
    
    fetchRelatedData();
  }, [workOrder]);

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
  );
};

export default WorkOrderContactCard;
