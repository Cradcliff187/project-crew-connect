
import { Card, CardContent } from '@/components/ui/card';
import { WorkOrder } from '@/types/workOrder';
import { User, MapPin, Building, Phone, Mail } from 'lucide-react';

interface WorkOrderContactCardProps {
  workOrder: WorkOrder;
  customer: { name: string; email: string; phone: string } | null;
  location: { name: string; address: string } | null;
  assignee: { name: string } | null;
}

const WorkOrderContactCard = ({ 
  workOrder,
  customer,
  location,
  assignee
}: WorkOrderContactCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {assignee && (
            <div className="flex items-start">
              <User className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">Assigned To</p>
                <p className="text-sm text-muted-foreground">{assignee.name}</p>
              </div>
            </div>
          )}
          
          {customer && (
            <div className="flex items-start">
              <Building className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">Customer</p>
                <p className="text-sm text-muted-foreground">{customer.name}</p>
                
                {(customer.email || customer.phone) && (
                  <div className="mt-1 space-y-1">
                    {customer.email && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Mail className="h-3 w-3 mr-1" />
                        <span>{customer.email}</span>
                      </div>
                    )}
                    
                    {customer.phone && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Phone className="h-3 w-3 mr-1" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {location && (
            <div className="flex items-start">
              <MapPin className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-sm text-muted-foreground">{location.name}</p>
                {location.address && (
                  <p className="text-xs text-muted-foreground mt-1">{location.address}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkOrderContactCard;
