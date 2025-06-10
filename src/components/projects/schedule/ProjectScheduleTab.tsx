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
import { createScheduleItem, ScheduleItem } from '@/lib/calendarService';

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
      const scheduleItemData: ScheduleItem = {
        project_id: projectId,
        title: eventData.title,
        description: eventData.description,
        start_datetime: eventData.startTime,
        end_datetime: eventData.endTime,
      };

      const result = await createScheduleItem(scheduleItemData);

      if (result.id) {
        toast({
          title: 'Event Scheduled Successfully',
          description: `Added to project calendar. Event ID: ${result.google_event_id}`,
        });
        return true;
      } else {
        toast({
          title: 'Scheduling Failed',
          description: 'Failed to schedule event',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Error creating schedule item:', error);
      toast({
        title: 'Failed to Create Event',
        description: error.message || 'An unexpected error occurred while scheduling',
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
