import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChangeOrder, ChangeOrderStatus } from '@/types/changeOrders';
import { Loader2 } from 'lucide-react';
import StatusHistoryView from '@/components/common/status/StatusHistoryView';
import ChangeOrderStatusControl from './ChangeOrderStatusControl';
import { toast } from '@/hooks/use-toast';
import { EntityType } from '@/hooks/useStatusHistory';

interface ChangeOrderApprovalProps {
  form: UseFormReturn<ChangeOrder>;
  changeOrderId?: string;
  onUpdated: () => void;
}

const ChangeOrderApproval: React.FC<ChangeOrderApprovalProps> = ({
  form,
  changeOrderId,
  onUpdated,
}) => {
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [statusOptions, setStatusOptions] = useState<any[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Safely access form fields
  const currentStatus = form?.watch ? (form.watch('status') as ChangeOrderStatus) : 'DRAFT';

  useEffect(() => {
    if (changeOrderId) {
      fetchStatusData();
      fetchApprovalNotes();
    } else {
      setLoadingStatus(false);
    }
  }, [changeOrderId]);

  const fetchApprovalNotes = async () => {
    if (!changeOrderId) return;

    try {
      const { data, error } = await supabase
        .from('change_orders')
        .select('approval_notes')
        .eq('id', changeOrderId)
        .single();

      if (error) throw error;

      if (data && data.approval_notes) {
        setNotes(data.approval_notes);
      }
    } catch (error) {
      console.error('Error fetching approval notes:', error);
    }
  };

  const fetchStatusData = async () => {
    if (!changeOrderId) return;
    console.log(`[ChangeOrderApproval] Fetching status data for CO: ${changeOrderId}`);
    setLoadingStatus(true);
    setHistory([]);
    setStatusOptions([]);

    try {
      // Fetch status definitions first
      console.log('[ChangeOrderApproval] Fetching status definitions...');
      const { data: statusDefs, error: statusError } = await supabase
        .from('status_definitions')
        .select('*')
        .eq('entity_type', 'CHANGE_ORDER' as any);

      if (statusError) {
        console.error('[ChangeOrderApproval] Error fetching status definitions:', statusError);
        toast({
          title: 'Error',
          description: 'Could not load status options.',
          variant: 'destructive',
        });
        setStatusOptions([]);
      } else {
        console.log('[ChangeOrderApproval] Fetched status definitions:', statusDefs);
        const mappedOptions = (statusDefs || []).map(def => ({
          value: def.status_code,
          label: def.label,
          color: def.color,
        }));
        console.log('[ChangeOrderApproval] Mapped status options:', mappedOptions);
        setStatusOptions(mappedOptions);
      }

      // Then fetch the history
      console.log('[ChangeOrderApproval] Fetching history...');
      const { data: historyData, error: historyError } = await supabase
        .from('activitylog')
        .select('*')
        .eq('referenceid', changeOrderId)
        .eq('moduletype', 'CHANGE_ORDER')
        .order('timestamp', { ascending: false });

      if (historyError) {
        console.error('[ChangeOrderApproval] Error fetching history:', historyError);
        toast({
          title: 'Error',
          description: 'Could not load status history.',
          variant: 'destructive',
        });
        setHistory([]);
      } else {
        console.log('[ChangeOrderApproval] Fetched history data:', historyData);
        const formattedHistory = (historyData || []).map(item => ({
          status: item.status,
          previous_status: item.previousstatus,
          changed_date: item.timestamp,
          changed_by: item.useremail,
          notes: item.detailsjson ? JSON.parse(item.detailsjson)?.notes : item.action,
        }));
        console.log('[ChangeOrderApproval] Formatted history:', formattedHistory);
        setHistory(formattedHistory);
      }
    } catch (error: any) {
      console.error('[ChangeOrderApproval] Error in fetchStatusData catch block:', error);
      setHistory([]);
      setStatusOptions([]);
      toast({
        title: 'Error',
        description: 'Could not load status details.',
        variant: 'destructive',
      });
    } finally {
      console.log('[ChangeOrderApproval] fetchStatusData finished.');
      setLoadingStatus(false);
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleSaveNotes = async () => {
    if (!changeOrderId) {
      toast({
        title: 'Error',
        description: 'Change order ID not found',
        variant: 'destructive',
      });
      return;
    }

    setIsSavingNotes(true);
    try {
      const { error } = await supabase
        .from('change_orders')
        .update({ approval_notes: notes })
        .eq('id', changeOrderId);

      if (error) throw error;

      // Update the form value if form is available
      if (form && form.setValue) {
        form.setValue('approval_notes', notes);
      }

      toast({
        title: 'Notes saved',
        description: 'Approval notes updated successfully',
      });
    } catch (error: any) {
      console.error('Error saving notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notes: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleStatusChange = async () => {
    await fetchStatusData();
    onUpdated();
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Approval Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about the approval process..."
              value={notes}
              onChange={handleNotesChange}
            />
            <Button
              variant="outline"
              className="mt-2 w-fit"
              onClick={handleSaveNotes}
              disabled={isSavingNotes}
            >
              {isSavingNotes ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Notes'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status History</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStatus ? (
            <div className="flex justify-center items-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <StatusHistoryView
              history={history}
              statusOptions={statusOptions}
              currentStatus={currentStatus}
            />
          )}
        </CardContent>
      </Card>

      {changeOrderId && (
        <div className="flex justify-end mt-4">
          {loadingStatus ? (
            <div className="h-10 flex items-center text-sm text-muted-foreground">
              Loading status options...
            </div>
          ) : (
            <ChangeOrderStatusControl
              changeOrderId={changeOrderId}
              currentStatus={currentStatus}
              onStatusChange={handleStatusChange}
              statusOptions={statusOptions}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ChangeOrderApproval;
