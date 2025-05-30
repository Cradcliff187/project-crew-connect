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
      // Use the enhanced calendar service to create the event
      const result = await EnhancedCalendarService.createEvent({
        ...eventData,
        entityId: `project-schedule-${Date.now()}`, // Generate temporary ID
        projectId,
      });

      if (result.success) {
        toast({
          title: 'Event Scheduled Successfully',
          description: `Created event on ${result.calendarSelection?.primaryCalendar.name}${
            result.invitesSent && result.invitesSent.length > 0
              ? ` and sent invites to ${result.invitesSent.length} attendee(s)`
              : ''
          }`,
        });

        // Log the intelligent calendar selection for demo purposes
        console.log('Calendar Selection Result:', {
          primary: result.calendarSelection?.primaryCalendar,
          additional: result.calendarSelection?.additionalCalendars,
          invites: result.calendarSelection?.individualInvites,
          eventIds: {
            primary: result.primaryEventId,
            additional: result.additionalEventIds,
          },
        });

        return true;
      } else {
        toast({
          title: 'Scheduling Failed',
          description: result.errors?.join(', ') || 'Unknown error occurred',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Error scheduling event:', error);
      toast({
        title: 'Scheduling Error',
        description: error instanceof Error ? error.message : 'Failed to schedule event',
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
