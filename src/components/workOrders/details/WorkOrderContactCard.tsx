
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkOrder } from '@/types/workOrder';
import { User, Building2 } from 'lucide-react';

export interface WorkOrderContactCardProps {
  workOrder: WorkOrder;
  customer: { name: string; email: string; phone: string } | null;
  location: { name: string; address: string } | null;
  assignee: { name: string } | null;
}

export const WorkOrderContactCard = ({ 
  workOrder, 
  customer,
  location,
  assignee
}: WorkOrderContactCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Contacts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {customer && (
          <div className="flex items-start space-x-2.5">
            <div className="mt-0.5">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Customer</h4>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{customer.name}</p>
                <p>{customer.email}</p>
                <p>{customer.phone}</p>
              </div>
            </div>
          </div>
        )}

        {location && (
          <div className="flex items-start space-x-2.5">
            <div className="mt-0.5">
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Location</h4>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{location.name}</p>
                <p>{location.address}</p>
              </div>
            </div>
          </div>
        )}

        {assignee && (
          <div className="flex items-start space-x-2.5">
            <div className="mt-0.5">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Assigned To</h4>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{assignee.name}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkOrderContactCard;
