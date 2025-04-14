import { UseFormReturn } from 'react-hook-form';
import { WorkOrderFormValues } from './WorkOrderFormSchema';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';

interface WorkOrderSummaryProps {
  form: UseFormReturn<WorkOrderFormValues>;
}

const WorkOrderSummary = ({ form }: WorkOrderSummaryProps) => {
  const values = form.getValues();

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Not specified';
    return format(new Date(date), 'MMMM d, yyyy');
  };

  const formattedScheduledDate = values.scheduled_date
    ? formatDate(values.scheduled_date)
    : 'Not set';

  const formattedDueDate = values.due_by_date ? formatDate(values.due_by_date) : 'Not set';

  const locationDetails = values.useCustomAddress
    ? `${values.address || ''}, ${values.city || ''}, ${values.state || ''} ${values.zip || ''}`
    : 'Using existing location';

  return (
    <div className="space-y-4">
      <h3 className="text-md font-semibold text-gray-700">Summary</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Please review the work order information before submitting.
      </p>

      <Card className="border border-gray-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-[#0485ea]">Basic Information</h4>
              <div className="mt-2 space-y-2">
                <div>
                  <span className="text-sm font-medium">Title:</span>
                  <p className="text-sm">{values.title}</p>
                </div>

                <div>
                  <span className="text-sm font-medium">Work Order Number:</span>
                  <p className="text-sm">{values.work_order_number || 'Not specified'}</p>
                </div>

                <div>
                  <span className="text-sm font-medium">Description:</span>
                  <p className="text-sm line-clamp-3">{values.description || 'Not specified'}</p>
                </div>

                <div>
                  <span className="text-sm font-medium">Priority:</span>
                  <p className="text-sm capitalize">{values.priority?.toLowerCase() || 'Medium'}</p>
                </div>

                <div>
                  <span className="text-sm font-medium">PO Number:</span>
                  <p className="text-sm">{values.po_number || 'Not specified'}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-[#0485ea]">Schedule Information</h4>
              <div className="mt-2 space-y-2">
                <div>
                  <span className="text-sm font-medium">Estimated Hours:</span>
                  <p className="text-sm">{values.time_estimate || 'Not specified'}</p>
                </div>

                <div>
                  <span className="text-sm font-medium">Scheduled Date:</span>
                  <p className="text-sm">{formattedScheduledDate}</p>
                </div>

                <div>
                  <span className="text-sm font-medium">Due By Date:</span>
                  <p className="text-sm">{formattedDueDate}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-medium text-[#0485ea]">Location Information</h4>

            {values.useCustomAddress ? (
              <div className="mt-2 space-y-2">
                <div>
                  <span className="text-sm font-medium">Custom Address:</span>
                  <p className="text-sm">{locationDetails}</p>
                </div>
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                <div>
                  <span className="text-sm font-medium">Customer:</span>
                  <p className="text-sm">{values.customer_id || 'Not selected'}</p>
                </div>

                <div>
                  <span className="text-sm font-medium">Location:</span>
                  <p className="text-sm">{values.location_id || 'Not selected'}</p>
                </div>
              </div>
            )}

            <div className="mt-2">
              <span className="text-sm font-medium">Assigned To:</span>
              <p className="text-sm">{values.assigned_to || 'Not assigned'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkOrderSummary;
