
import React, { useState } from 'react';
import { TimeEntry } from '@/types/timeTracking';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils';
import { formatTime, getTimeOfDay } from './utils/timeUtils';
import { Edit, Trash, Clock } from 'lucide-react';
import TimeEntryEditDialog from './TimeEntryEditDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import DeleteConfirmationDialog from '@/components/ui/delete-confirmation-dialog';

interface TimeEntryListProps {
  entries: TimeEntry[];
  isLoading: boolean;
  onEntryChange: () => void;
  isMobile?: boolean;
}

export const TimeEntryList = ({
  entries,
  isLoading,
  onEntryChange,
  isMobile = false
}: TimeEntryListProps) => {
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);
  
  // Group entries by date for better organization
  const entriesByDate = entries.reduce((acc, entry) => {
    const date = entry.date_worked;
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, TimeEntry[]>);
  
  // Format dates for display
  const formattedDates = Object.keys(entriesByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );
  
  // Handle edit button click
  const handleEdit = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setIsEditing(true);
  };
  
  // Handle save edited entry
  const handleSaveEdit = async (updatedEntry: TimeEntry) => {
    try {
      // Calculate updated cost if employee_rate exists
      let updatedCost = updatedEntry.total_cost;
      if (updatedEntry.employee_rate) {
        updatedCost = updatedEntry.hours_worked * updatedEntry.employee_rate;
      }
      
      const { error } = await supabase
        .from('time_entries')
        .update({
          start_time: updatedEntry.start_time,
          end_time: updatedEntry.end_time,
          hours_worked: updatedEntry.hours_worked,
          notes: updatedEntry.notes,
          total_cost: updatedCost,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedEntry.id);
        
      if (error) throw error;
      
      toast({
        title: 'Time entry updated',
        description: 'The time entry has been updated successfully.',
      });
      
      setIsEditing(false);
      setEditingEntry(null);
      onEntryChange();
    } catch (error: any) {
      console.error('Error updating time entry:', error);
      toast({
        title: 'Error updating time entry',
        description: error.message || 'An error occurred while updating the entry.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle delete button click
  const handleDelete = (entryId: string) => {
    setDeleteEntryId(entryId);
    setDeleteConfirmVisible(true);
  };
  
  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!deleteEntryId) return;
    
    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', deleteEntryId);
        
      if (error) throw error;
      
      toast({
        title: 'Time entry deleted',
        description: 'The time entry has been deleted successfully.',
      });
      
      setDeleteConfirmVisible(false);
      setDeleteEntryId(null);
      onEntryChange();
    } catch (error: any) {
      console.error('Error deleting time entry:', error);
      toast({
        title: 'Error deleting time entry',
        description: error.message || 'An error occurred while deleting the entry.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle cancel delete
  const handleCancelDelete = () => {
    setDeleteConfirmVisible(false);
    setDeleteEntryId(null);
  };
  
  // If loading, show skeleton UI
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-5 w-1/3 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  // If no entries, show empty state
  if (entries.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900">No time entries yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Create your first time entry to track your work.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {formattedDates.map((date) => (
        <div key={date} className="space-y-2">
          <h3 className="font-medium text-sm text-gray-500">
            {formatDate(date)}
          </h3>
          <div className="space-y-3">
            {entriesByDate[date].map((entry) => {
              // Get time of day for better UI context
              const hour = parseInt(entry.start_time.split(':')[0], 10);
              const timeOfDay = getTimeOfDay(hour);
              
              // Format start and end times for display
              const formattedStartTime = formatTime(entry.start_time);
              const formattedEndTime = formatTime(entry.end_time);
              
              return (
                <Card key={entry.id} className="overflow-hidden">
                  <CardContent className={`p-4 ${isMobile ? 'space-y-2' : 'flex justify-between items-start'}`}>
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className="text-[#0485ea] font-medium">
                          {entry.entity_name || (entry.entity_type === 'work_order' ? 'Work Order' : 'Project')}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-1">
                        {formattedStartTime} - {formattedEndTime} ({entry.hours_worked} hrs)
                      </div>
                      
                      {entry.employee_name && (
                        <div className="text-sm text-gray-500">
                          {entry.employee_name}
                        </div>
                      )}
                      
                      {entry.notes && (
                        <div className="mt-2 text-sm text-gray-600">
                          {entry.notes}
                        </div>
                      )}
                    </div>
                    
                    <div className={`${isMobile ? 'flex justify-end pt-2' : 'flex-shrink-0 ml-4'}`}>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEdit(entry)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4 text-gray-500" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(entry.id)}
                          className="h-8 w-8 p-0 text-red-500"
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <Separator className="my-4" />
        </div>
      ))}
      
      {/* Edit Dialog */}
      <TimeEntryEditDialog 
        timeEntry={editingEntry}
        open={isEditing}
        onOpenChange={setIsEditing}
        onSave={handleSaveEdit}
        isSaving={false}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteConfirmVisible}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Time Entry"
        description="Are you sure you want to delete this time entry? This action cannot be undone."
      />
    </div>
  );
};
