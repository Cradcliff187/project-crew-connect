
import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChangeOrder, ChangeOrderStatus } from '@/types/changeOrders';
import { Loader2 } from 'lucide-react';
import UniversalStatusControl, { StatusOption } from '@/components/common/status/UniversalStatusControl';
import { useStatusOptions } from '@/hooks/useStatusOptions';
import StatusHistoryView from '@/components/common/status/StatusHistoryView';

interface ChangeOrderApprovalProps {
  form: UseFormReturn<ChangeOrder>;
  changeOrderId?: string;
  onUpdated: () => void;
}

const ChangeOrderApproval = ({ form, changeOrderId, onUpdated }: ChangeOrderApprovalProps) => {
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const currentStatus = form.watch('status') as ChangeOrderStatus;
  const { statusOptions } = useStatusOptions('CHANGE_ORDER', currentStatus);
  
  useEffect(() => {
    if (changeOrderId) {
      fetchHistory();
    }
  }, [changeOrderId]);

  const fetchHistory = async () => {
    if (!changeOrderId) return;
    
    try {
      const { data, error } = await supabase
        .from('activitylog')
        .select('*')
        .eq('referenceid', changeOrderId)
        .eq('moduletype', 'CHANGE_ORDER')
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match our expected format
      const formattedHistory = data?.map(item => ({
        status: item.status,
        previous_status: item.previousstatus,
        changed_date: item.timestamp,
        changed_by: item.useremail,
        notes: item.detailsjson
      })) || [];
      
      setHistory(formattedHistory);
    } catch (error: any) {
      console.error('Error fetching status history:', error);
      setHistory([]);
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleSaveNotes = async () => {
    if (!changeOrderId) return;
    
    setIsSavingNotes(true);
    try {
      const { error } = await supabase
        .from('change_orders')
        .update({ approval_notes: notes })
        .eq('id', changeOrderId);
      
      if (error) throw error;
      
      // Optionally, show a success message
      console.log('Notes saved successfully');
    } catch (error: any) {
      console.error('Error saving notes:', error);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleStatusChange = async () => {
    await fetchHistory();
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
                "Save Notes"
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
          <StatusHistoryView 
            history={history} 
            statusOptions={statusOptions}
            currentStatus={currentStatus}
          />
        </CardContent>
      </Card>
      
      <div className="flex justify-end mt-4">
        <UniversalStatusControl
          entityId={changeOrderId || ''}
          entityType="CHANGE_ORDER"
          currentStatus={currentStatus}
          statusOptions={statusOptions}
          tableName="change_orders"
          idField="id"
          onStatusChange={handleStatusChange}
          recordHistory={true}
          size="md"
          showStatusBadge={true}
          className=""
        />
      </div>
    </div>
  );
};

export default ChangeOrderApproval;
