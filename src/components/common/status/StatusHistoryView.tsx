
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusOption } from './UniversalStatusControl';

interface StatusHistoryEntry {
  status: string;
  previous_status?: string;
  changed_date: string;
  changed_by?: string;
  notes?: string;
}

export interface StatusHistoryViewProps {
  history: StatusHistoryEntry[];
  statusOptions: StatusOption[];
  currentStatus: string;
  showEmpty?: boolean;
}

const StatusHistoryView: React.FC<StatusHistoryViewProps> = ({
  history,
  statusOptions = [], // Default to empty array if undefined
  currentStatus,
  showEmpty = true
}) => {
  // Safeguard against undefined or null history
  const safeHistory = Array.isArray(history) ? history : [];
  
  if (safeHistory.length === 0 && !showEmpty) {
    return null;
  }

  const getStatusLabel = (status: string): string => {
    if (!status) return 'Unknown';
    // Safely check statusOptions is an array and has elements
    if (!Array.isArray(statusOptions) || statusOptions.length === 0) {
      return status;
    }
    
    const option = statusOptions.find(opt => 
      opt?.value?.toLowerCase() === status?.toLowerCase()
    );
    return option?.label || status;
  };

  // Helper function to get the time period in readable format
  const getTimePeriod = (dateString: string): string => {
    if (!dateString) return 'Unknown time';
    
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown time';
    }
  };

  // Helper to safely parse JSON notes
  const getNotesText = (notesData: any): string | undefined => {
    if (!notesData) return undefined;
    
    if (typeof notesData === 'string') {
      try {
        const parsed = JSON.parse(notesData);
        return parsed.notes || notesData;
      } catch (e) {
        return notesData;
      }
    }
    
    return notesData.notes || JSON.stringify(notesData);
  };

  return (
    <div className="space-y-4">
      {safeHistory.length === 0 ? (
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground">
            No status history available.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {safeHistory.map((entry, index) => (
            <div key={index} className="flex items-start gap-2 p-3 rounded-md border bg-card">
              <div className="mt-0.5">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">
                      Status changed to <span className="text-primary">{getStatusLabel(entry.status)}</span>
                    </p>
                    {entry.previous_status && (
                      <p className="text-sm text-muted-foreground">
                        From {getStatusLabel(entry.previous_status)}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {getTimePeriod(entry.changed_date)}
                  </p>
                </div>
                {entry.changed_by && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">By:</span> {entry.changed_by}
                  </p>
                )}
                {entry.notes && (
                  <div className="mt-1 text-sm">
                    <p className="text-muted-foreground font-medium">Notes:</p>
                    <p className="mt-1 text-foreground">{getNotesText(entry.notes)}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusHistoryView;
