
import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, CheckCircle, XCircle } from 'lucide-react';
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

interface ChangeOrderApprovalProps {
  form: UseFormReturn<ChangeOrder>;
  changeOrderId?: string;
  onUpdated: () => void;
}

const ChangeOrderApproval = ({ form, changeOrderId, onUpdated }: ChangeOrderApprovalProps) => {
  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const status = form.watch('status');
  const canApprove = status === 'REVIEW';
  const canReject = status === 'REVIEW';
  const canSubmit = status === 'DRAFT';
  const canImplement = status === 'APPROVED';
  const canCancel = ['DRAFT', 'SUBMITTED', 'REVIEW'].includes(status);

  useEffect(() => {
    if (changeOrderId) {
      fetchStatusHistory();
    }
  }, [changeOrderId]);

  const fetchStatusHistory = async () => {
    if (!changeOrderId) return;
    
    try {
      const { data, error } = await supabase
        .from('change_order_status_history')
        .select('*')
        .eq('change_order_id', changeOrderId)
        .order('changed_date', { ascending: false });
      
      if (error) throw error;
      setStatusHistory(data || []);
    } catch (error: any) {
      console.error('Error fetching status history:', error);
    }
  };

  const updateStatus = async (newStatus: ChangeOrderStatus) => {
    if (!changeOrderId) return;
    
    setLoading(true);
    try {
      const updateData: Partial<ChangeOrder> = {
        status: newStatus
      };
      
      // For approvals, record who approved and when
      if (newStatus === 'APPROVED') {
        updateData.approved_by = form.getValues('approved_by') || 'System User';
        updateData.approved_date = new Date().toISOString();
        updateData.approval_notes = form.getValues('approval_notes');
      }
      
      // For rejections, still record the notes
      if (newStatus === 'REJECTED') {
        updateData.approval_notes = form.getValues('approval_notes');
      }
      
      const { error } = await supabase
        .from('change_orders')
        .update(updateData)
        .eq('id', changeOrderId);
      
      if (error) throw error;
      
      // Update the form value
      form.setValue('status', newStatus);
      
      // If approved or rejected, refresh status history
      await fetchStatusHistory();
      onUpdated();
      
      toast({
        title: `Change order ${newStatus.toLowerCase()}`,
        description: `The change order has been ${newStatus.toLowerCase()}.`
      });
    } catch (error: any) {
      console.error(`Error updating status to ${newStatus}:`, error);
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return format(new Date(dateString), 'PPP');
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
                  disabled={!canApprove || loading}
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
                  disabled={!canApprove && !canReject || loading}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            {canSubmit && (
              <Button 
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => updateStatus('SUBMITTED')}
                disabled={loading}
              >
                Submit for Review
              </Button>
            )}
            
            {canApprove && (
              <Button 
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={() => updateStatus('APPROVED')}
                disabled={loading || !form.watch('approved_by')}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            )}
            
            {canReject && (
              <Button 
                variant="outline"
                className="text-red-500 border-red-500 hover:bg-red-50"
                onClick={() => updateStatus('REJECTED')}
                disabled={loading}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            )}
            
            {canImplement && (
              <Button 
                className="bg-purple-500 hover:bg-purple-600 text-white"
                onClick={() => updateStatus('IMPLEMENTED')}
                disabled={loading}
              >
                Mark as Implemented
              </Button>
            )}
            
            {canCancel && (
              <Button 
                variant="outline"
                className="text-gray-500"
                onClick={() => updateStatus('CANCELLED')}
                disabled={loading}
              >
                Cancel Change Order
              </Button>
            )}
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status History</CardTitle>
          </CardHeader>
          <CardContent>
            {statusHistory.length === 0 ? (
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
