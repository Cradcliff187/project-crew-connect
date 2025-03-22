
import React from 'react';
import { format } from 'date-fns';
import { CalendarClock, User, FileText, DollarSign, Briefcase, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TimeEntry } from '@/types/timeTracking';
import { formatTimeRange } from '@/lib/utils';
import ReceiptButton from './components/ReceiptButton';

interface TimeEntryDetailProps {
  timeEntry: TimeEntry;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
  onViewReceipts: () => Promise<void>;
}

const TimeEntryDetail: React.FC<TimeEntryDetailProps> = ({
  timeEntry,
  onEdit,
  onDelete,
  onClose,
  onViewReceipts
}) => {
  if (!timeEntry) return null;
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold">Time Entry Details</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground flex items-center">
              <CalendarClock className="h-4 w-4 mr-2" />
              Date & Time
            </p>
            <p className="text-lg font-medium">
              {format(new Date(timeEntry.date_worked), 'MMMM d, yyyy')}
            </p>
            <p className="text-base">
              {formatTimeRange(timeEntry.start_time, timeEntry.end_time)}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground flex items-center">
              <Timer className="h-4 w-4 mr-2" />
              Hours & Cost
            </p>
            <p className="text-lg font-medium">
              {timeEntry.hours_worked} hours
            </p>
            <p className="text-base flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              {(timeEntry.total_cost || 0).toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground flex items-center mb-1">
              <Briefcase className="h-4 w-4 mr-2" />
              {timeEntry.entity_type === 'work_order' ? 'Work Order' : 'Project'}
            </p>
            <p className="text-base font-medium">
              {timeEntry.entity_name || `Unknown ${timeEntry.entity_type.replace('_', ' ')}`}
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground flex items-center mb-1">
              <User className="h-4 w-4 mr-2" />
              Employee
            </p>
            <p className="text-base">
              {timeEntry.employee_name || 'No employee assigned'}
            </p>
          </div>
        </div>
        
        {timeEntry.notes && (
          <div className="border rounded-md p-3 space-y-1">
            <p className="text-sm font-medium text-muted-foreground flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Notes
            </p>
            <p className="text-sm whitespace-pre-wrap">{timeEntry.notes}</p>
          </div>
        )}
        
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Receipt Status
          </p>
          <ReceiptButton timeEntry={timeEntry} onClick={onViewReceipts} />
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex space-x-2">
          <Button onClick={onEdit} variant="outline">
            Edit
          </Button>
          <Button onClick={onDelete} variant="destructive">
            Delete
          </Button>
        </div>
        <Button onClick={onClose}>
          Close
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TimeEntryDetail;
