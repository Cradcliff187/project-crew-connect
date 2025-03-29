
import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter,
  CardDescription
} from '@/components/ui/card';
import { format } from 'date-fns';
import { ChangeOrder, ChangeOrderStatus } from '@/types/changeOrders';
import ChangeOrderStatusBadge from './ChangeOrderStatusBadge';
import UniversalStatusControl from '@/components/common/status/UniversalStatusControl';
import { useStatusOptions } from '@/hooks/useStatusOptions';
import { useStatusHistory } from '@/hooks/useStatusHistory';

interface ChangeOrderApprovalProps {
  form: UseFormReturn<ChangeOrder>;
  changeOrderId?: string;
  onUpdated: () => void;
}

const ChangeOrderApproval = ({ form, changeOrderId, onUpdated }: ChangeOrderApprovalProps) => {
  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const status = form.watch('status');
  const { statusOptions } = useStatusOptions('CHANGE_ORDER', status);
  const { fetchStatusHistory } = useStatusHistory({
    entityId: changeOrderId || '',
    entityType: 'CHANGE_ORDER'
  });

  useEffect(() => {
    if (changeOrderId) {
      loadStatusHistory();
    }
  }, [changeOrderId]);

  const loadStatusHistory = async () => {
    if (!changeOrderId) return;
    
    setLoading(true);
    try {
      const history = await fetchStatusHistory();
      setStatusHistory(history);
    } catch (error) {
      console.error('Error loading status history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChanged = async () => {
    // Refresh status history after change
    await loadStatusHistory();
    onUpdated();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return format(new Date(dateString), 'PPP');
  };

  // Special fields to update based on status
  const getAdditionalFieldsForStatus = (newStatus: string) => {
    const additionalFields: Record<string, any> = {};
    
    // For approvals, record who approved and when
    if (newStatus === 'APPROVED') {
      additionalFields.approved_by = form.getValues('approved_by') || 'System User';
      additionalFields.approved_date = new Date().toISOString();
      additionalFields.approval_notes = form.getValues('approval_notes');
    }
    
    // For rejections, still record the notes
    if (newStatus === 'REJECTED') {
      additionalFields.approval_notes = form.getValues('approval_notes');
    }
    
    return additionalFields;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status & Approval</CardTitle>
            <CardDescription>Current status: <ChangeOrderStatusBadge status={status} /></CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="approved_by">Approved By</Label>
                <Input
                  id="approved_by"
                  {...form.register('approved_by')}
                  placeholder="Enter approver name"
                />
              </div>
              
              {form.watch('approved_date') && (
                <div>
                  <Label>Approval Date</Label>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(form.watch('approved_date'))}
                  </div>
                </div>
              )}
              
              <div>
                <Label htmlFor="approval_notes">Approval Notes</Label>
                <Textarea
                  id="approval_notes"
                  {...form.register('approval_notes')}
                  placeholder="Enter approval or rejection notes"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            {changeOrderId && (
              <UniversalStatusControl 
                entityId={changeOrderId}
                entityType="CHANGE_ORDER"
                currentStatus={status}
                statusOptions={statusOptions}
                tableName="change_orders"
                idField="id"
                onStatusChange={handleStatusChanged}
                additionalUpdateFields={getAdditionalFieldsForStatus(form.getValues().status)}
                className="w-full"
                showStatusBadge={false}
                buttonLabel="Update Status"
                userIdentifier={form.getValues().approved_by}
                notes={form.getValues().approval_notes}
              />
            )}
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-muted-foreground text-sm">Loading status history...</div>
            ) : statusHistory.length === 0 ? (
              <p className="text-muted-foreground text-sm">No status changes recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {statusHistory.map((history, index) => (
                  <div 
                    key={history.id || index}
                    className="border-l-2 border-gray-200 pl-4 pb-2"
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="flex items-center">
                          <ChangeOrderStatusBadge status={history.status} className="mr-2" />
                          {history.previous_status && (
                            <span className="text-xs text-muted-foreground">
                              from {history.previous_status}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDate(history.changed_date)}
                        </div>
                      </div>
                      
                      {history.changed_by && (
                        <div className="text-sm">{history.changed_by}</div>
                      )}
                    </div>
                    
                    {history.notes && (
                      <div className="mt-2 text-sm bg-muted/50 p-2 rounded-md">
                        {history.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChangeOrderApproval;
