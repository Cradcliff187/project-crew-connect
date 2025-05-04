import { useState } from 'react';
import { Calendar as CalendarIcon, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProjectMilestones from '../milestones/ProjectMilestones';
import ProjectCalendarView from '../calendar/ProjectCalendarView';

interface ProjectScheduleTabProps {
  projectId: string;
}

export default function ProjectScheduleTab({ projectId }: ProjectScheduleTabProps) {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Project Schedule</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className={viewMode === 'list' ? 'bg-muted' : ''}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-2" />
            List View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={viewMode === 'calendar' ? 'bg-muted' : ''}
            onClick={() => setViewMode('calendar')}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendar View
          </Button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <ProjectMilestones projectId={projectId} />
      ) : (
        <ProjectCalendarView projectId={projectId} />
      )}
    </div>
  );
}
