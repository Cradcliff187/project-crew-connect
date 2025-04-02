
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import StatusHistoryView from './StatusHistoryView';
import { StatusOption } from './UniversalStatusControl';

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
    if (open && entityId) {
      fetchHistory();
    }
  }, [open, entityId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // Fetch from activitylog which is guaranteed to exist
      const { data, error } = await supabase
        .from('activitylog')
        .select('*')
        .eq('referenceid', entityId)
        .eq('moduletype', entityType)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match our expected format
      const formattedHistory = data?.map(item => ({
        status: item.status,
        previous_status: item.previousstatus,
        changed_date: item.timestamp,
        changed_by: item.useremail,
        notes: item.detailsjson ? JSON.parse(item.detailsjson)?.notes : item.action
      })) || [];
      
      setHistory(formattedHistory);
    } catch (error: any) {
      console.error('Error fetching status history:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Status History</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {loading ? (
            <div className="text-center py-4">Loading history...</div>
          ) : (
            <StatusHistoryView 
              history={history}
              statusOptions={statusOptions}
              currentStatus={currentStatus}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatusHistoryDialog;
