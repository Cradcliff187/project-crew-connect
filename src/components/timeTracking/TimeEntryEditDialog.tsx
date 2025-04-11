
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { TimeEntry } from '@/types/timeTracking';
import { format } from 'date-fns';
import { parseTime, calculateHours } from '@/components/timeTracking/utils/timeUtils';

interface TimeEntryEditDialogProps {
  timeEntry: TimeEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedEntry: TimeEntry) => void;
  isSaving: boolean;
}

const TimeEntryEditDialog: React.FC<TimeEntryEditDialogProps> = ({
  timeEntry,
  open,
  onOpenChange,
  onSave,
  isSaving
}) => {
  const [editedEntry, setEditedEntry] = useState<TimeEntry | null>(null);
  
  useEffect(() => {
    if (timeEntry) {
      setEditedEntry({...timeEntry});
    }
  }, [timeEntry]);
  
  if (!editedEntry) return null;
  
  const handleTimeChange = (field: 'start_time' | 'end_time', value: string) => {
    setEditedEntry(prev => {
      if (!prev) return prev;
      
      const updatedEntry = { 
        ...prev, 
        [field]: value 
      };
      
      // Recalculate hours worked using the utility function
      const hoursWorked = calculateHours(
        field === 'start_time' ? value : prev.start_time,
        field === 'end_time' ? value : prev.end_time
      );
      
      updatedEntry.hours_worked = hoursWorked;
      
      return updatedEntry;
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedEntry) {
      onSave(editedEntry);
    }
  };
  
  const entityName = editedEntry.entity_name || 
    `${editedEntry.entity_type.charAt(0).toUpperCase() + editedEntry.entity_type.slice(1)} ${editedEntry.entity_id.slice(0, 8)}`;
  
  // Generate time options for select
  const times = Array.from({ length: 24 * 4 }, (_, i) => {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Time Entry</DialogTitle>
            <DialogDescription>
              Edit time entry for {entityName} on {format(new Date(editedEntry.date_worked), 'MMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="start_time">Start Time</Label>
                <select 
                  id="start_time"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                  value={editedEntry.start_time}
                  onChange={(e) => handleTimeChange('start_time', e.target.value)}
                >
                  {times.map(time => (
                    <option key={`start-${time}`} value={time}>{format(parseTime(time), 'h:mm a')}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="end_time">End Time</Label>
                <select 
                  id="end_time"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                  value={editedEntry.end_time}
                  onChange={(e) => handleTimeChange('end_time', e.target.value)}
                >
                  {times.map(time => (
                    <option key={`end-${time}`} value={time}>{format(parseTime(time), 'h:mm a')}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="hours_worked">Hours Worked</Label>
              <Input 
                id="hours_worked"
                type="text"
                value={editedEntry.hours_worked.toFixed(2)}
                readOnly
              />
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes"
                value={editedEntry.notes || ''}
                onChange={(e) => setEditedEntry({...editedEntry, notes: e.target.value})}
                placeholder="Add notes about this time entry"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-[#0485ea] hover:bg-[#0375d1]"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TimeEntryEditDialog;
