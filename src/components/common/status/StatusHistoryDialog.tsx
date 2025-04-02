
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { StatusOption } from './UniversalStatusControl';
import StatusHistoryView from './StatusHistoryView';

interface StatusHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityId: string;
  entityType: string;
  tableName: string;
  idField: string;
  currentStatus: string;
  statusOptions: StatusOption[];
}

const StatusHistoryDialog: React.FC<StatusHistoryDialogProps> = ({
  open,
  onOpenChange,
  entityId,
  entityType,
  tableName,
  idField,
  currentStatus,
  statusOptions
}) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchHistory();
    }
  }, [open, entityId]);

  const fetchHistory = async () => {
    if (!entityId) return;
    
    setLoading(true);
    try {
      // First try to get from status_history
      const { data, error } = await supabase
        .from('activitylog')
        .select('*')
        .eq('referenceid', entityId)
        .eq('moduletype', entityType)
        .order('timestamp', { ascending: false });
      
      if (error) {
        console.error('Error fetching status history:', error);
        setHistory([]);
      } else {
        // Transform the data to match our expected format
        const formattedHistory = data?.map(item => ({
          status: item.status,
          previous_status: item.previousstatus,
          changed_date: item.timestamp,
          changed_by: item.useremail,
          notes: item.detailsjson || item.action
        })) || [];
        
        setHistory(formattedHistory);
      }
    } catch (error) {
      console.error('Error in history fetch:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Status History</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <StatusHistoryView 
            history={history} 
            statusOptions={statusOptions}
            currentStatus={currentStatus}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StatusHistoryDialog;
