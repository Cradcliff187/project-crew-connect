import { useState } from 'react';
import { Calendar as CalendarIcon, List, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import ProjectMilestones from '../milestones/ProjectMilestones';
import ProjectCalendarView from '../calendar/ProjectCalendarView';
import UnifiedSchedulingDialog from '@/components/scheduling/UnifiedSchedulingDialog';
import {
  EnhancedCalendarService,
  EnhancedCalendarEventData,
} from '@/services/enhancedCalendarService';

interface ProjectScheduleTabProps {
  projectId: string;
  projectName?: string;
}

export default function ProjectScheduleTab({ projectId, projectName }: ProjectScheduleTabProps) {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [schedulingOpen, setSchedulingOpen] = useState(false);
  const { toast } = useToast();

  const handleScheduleNew = async (eventData: EnhancedCalendarEventData): Promise<boolean> => {
    try {
      console.log('Creating schedule item in database...', eventData);

      // Step 1: Create schedule item in database FIRST
      const scheduleItemData = {
        project_id: projectId,
        title: eventData.title,
        description: eventData.description || null,
        start_datetime: eventData.startTime,
        end_datetime: eventData.endTime,
        assignee_type: eventData.assignees?.[0]?.type || null,
        assignee_id: eventData.assignees?.[0]?.id || null,
        send_invite: eventData.assignees && eventData.assignees.length > 0,
        calendar_integration_enabled: true,
        is_all_day: false,
      };

      const response = await fetch('/api/schedule-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(scheduleItemData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create schedule item');
      }

      const { data: createdItem } = await response.json();
      console.log('Schedule item created successfully:', createdItem);

      // Step 2: Sync with Google Calendar
      try {
        const syncResponse = await fetch(`/api/schedule-items/${createdItem.id}/sync-calendar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        const syncResult = await syncResponse.json();

        if (syncResult.success) {
          toast({
            title: 'Event Created Successfully! 📅',
            description: `Schedule item saved and synced to Google Calendar. Event ID: ${syncResult.eventId}`,
          });
        } else {
          toast({
            title: 'Event Created (Calendar Sync Failed)',
            description:
              'Schedule item saved but Google Calendar sync failed. You can retry sync later.',
            variant: 'destructive',
          });
        }
      } catch (syncError) {
        console.warn('Calendar sync failed:', syncError);
        toast({
          title: 'Event Created (Calendar Sync Failed)',
          description:
            'Schedule item saved but Google Calendar sync failed. You can retry sync later.',
          variant: 'destructive',
        });
      }

      return true;
    } catch (error) {
      console.error('Error creating schedule item:', error);
      toast({
        title: 'Failed to Create Event',
        description: error instanceof Error ? error.message : 'Failed to create schedule item',
        variant: 'destructive',
      });
      return false;
    }
  };

  return (
    <>
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-montserrat flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
              Project Schedule & Milestones
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => setSchedulingOpen(true)}
                className="bg-[#0485ea] hover:bg-[#0375d1] font-opensans"
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule New
              </Button>
              <div className="flex rounded-md shadow-sm">
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'outline'}
                  size="sm"
                  className={`rounded-r-none font-opensans ${viewMode === 'list' ? 'shadow-none' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'secondary' : 'outline'}
                  size="sm"
                  className={`rounded-l-none border-l-0 font-opensans ${viewMode === 'calendar' ? 'shadow-none' : ''}`}
                  onClick={() => setViewMode('calendar')}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Calendar
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'list' ? (
            <ProjectMilestones projectId={projectId} />
          ) : (
            <ProjectCalendarView projectId={projectId} />
          )}
        </CardContent>
      </Card>

      {/* Unified Scheduling Dialog */}
      <UnifiedSchedulingDialog
        open={schedulingOpen}
        onOpenChange={setSchedulingOpen}
        context={{
          entityType: 'schedule_item',
          projectId,
          projectName,
        }}
        onSave={handleScheduleNew}
        onCancel={() => setSchedulingOpen(false)}
      />
    </>
  );
}
