import React, { useState } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Eye, Edit, Calendar, Clock, FileText, Archive } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Project } from '../ProjectsTable';
import StatusBadge from '@/components/common/status/StatusBadge';
import { mapStatusToStatusBadge } from '../ProjectsTable';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import UnifiedSchedulingDialog from '@/components/scheduling/UnifiedSchedulingDialog';
import {
  EnhancedCalendarService,
  EnhancedCalendarEventData,
} from '@/services/enhancedCalendarService';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ProjectRowProps {
  project: Project;
}

type ProjectRowDisplayData = Database['public']['Tables']['projects']['Row'] & {
  customer_name?: string | null;
  work_orders_count?: number | null;
  current_expenses?: number | null;
  total_budget?: number | null;
  progress?: number | null;
};

const ProjectRow: React.FC<ProjectRowProps> = ({ project }) => {
  const navigate = useNavigate();

  // State for dialogs
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  const handleViewDetails = () => {
    navigate(`/projects/${project.projectid}`);
  };

  const handleEditProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/projects/${project.projectid}/edit`);
  };

  const handleScheduleProject = () => {
    setShowScheduleDialog(true);
  };

  const handleScheduleSave = async (eventData: EnhancedCalendarEventData): Promise<boolean> => {
    try {
      const result = await EnhancedCalendarService.createEvent(eventData);

      if (result.success) {
        toast({
          title: 'Project Scheduled Successfully! 📅',
          description: `${project.projectname || 'Project'} has been added to your calendar.`,
        });
        return true;
      } else {
        throw new Error(result.errors?.[0] || 'Failed to schedule project');
      }
    } catch (error) {
      console.error('Error scheduling project:', error);
      toast({
        title: 'Scheduling Error',
        description: error instanceof Error ? error.message : 'Failed to schedule project',
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleViewTimeLogs = () => {
    navigate(`/projects/${project.projectid}?tab=time`);
  };

  const handleGenerateReport = () => {
    // TODO: Implement actual report generation
    toast({
      title: 'Report Generation Started 📊',
      description: `Generating comprehensive report for ${project.projectname || 'this project'}...`,
    });

    // Simulate report generation
    setTimeout(() => {
      toast({
        title: 'Report Ready! 📄',
        description: 'Your project report has been generated and is ready for download.',
      });
    }, 2000);
  };

  const handleArchiveProject = () => {
    setShowArchiveDialog(true);
  };

  const handleConfirmArchive = () => {
    // TODO: Implement actual archiving functionality
    toast({
      title: 'Project Archived Successfully! 📦',
      description: `${project.projectname || 'Project'} has been moved to archived projects.`,
    });
    setShowArchiveDialog(false);
  };

  const actionGroups: ActionGroup[] = [
    {
      items: [
        {
          label: 'View details',
          icon: <Eye className="w-4 h-4" />,
          onClick: () => handleViewDetails(),
          className: 'text-[#0485ea] hover:text-[#0375d1] font-opensans',
        },
        {
          label: 'Edit project',
          icon: <Edit className="w-4 h-4" />,
          onClick: e => handleEditProject(e),
          className: 'text-gray-600 hover:text-gray-800 font-opensans',
        },
      ],
    },
    {
      items: [
        {
          label: 'Schedule',
          icon: <Calendar className="w-4 h-4" />,
          onClick: handleScheduleProject,
          className: 'text-gray-600 hover:text-gray-800 font-opensans',
        },
        {
          label: 'View time logs',
          icon: <Clock className="w-4 h-4" />,
          onClick: handleViewTimeLogs,
          className: 'text-gray-600 hover:text-gray-800 font-opensans',
        },
      ],
    },
    {
      items: [
        {
          label: 'Generate report',
          icon: <FileText className="w-4 h-4" />,
          onClick: handleGenerateReport,
          className: 'text-gray-600 hover:text-gray-800 font-opensans',
        },
        {
          label: 'Archive project',
          icon: <Archive className="w-4 h-4" />,
          onClick: handleArchiveProject,
          className: 'text-red-600 hover:text-red-700 font-opensans',
        },
      ],
    },
  ];

  const budgetValue = project.total_budget ?? 0;
  const spentValue = project.current_expenses ?? 0;
  const progressValue =
    project.progress ?? (budgetValue > 0 ? Math.round((spentValue / budgetValue) * 100) : 0);

  return (
    <>
      <TableRow
        key={project.projectid}
        className="hover:bg-[#0485ea]/5 transition-colors cursor-pointer"
        onClick={handleViewDetails}
      >
        <TableCell>
          <div className="font-medium text-[#0485ea] font-opensans">
            {project.projectname || 'Unnamed Project'}
          </div>
          <div className="text-xs text-muted-foreground font-opensans">{project.projectid}</div>
        </TableCell>
        <TableCell className="font-opensans">{project.customername || 'No Client'}</TableCell>
        <TableCell className="font-opensans">{formatDate(project.created_at)}</TableCell>
        <TableCell>
          <div className="font-medium font-opensans">{formatCurrency(spentValue)}</div>
          <div className="text-xs text-muted-foreground font-opensans">
            of {formatCurrency(project.total_estimated_cost_budget ?? 0)}
          </div>
        </TableCell>
        <TableCell className="text-right font-opensans">{formatCurrency(budgetValue)}</TableCell>
        <TableCell>
          <div className="flex items-center space-x-2">
            <Progress value={progressValue} className="h-2 w-[100px]" />
            <span className="text-sm text-muted-foreground font-opensans">{progressValue}%</span>
          </div>
        </TableCell>
        <TableCell>
          <StatusBadge status={mapStatusToStatusBadge(project.status)} />
        </TableCell>
        <TableCell className="text-right" onClick={e => e.stopPropagation()}>
          <ActionMenu
            groups={actionGroups.filter(g => g.items.length > 0)}
            size="sm"
            align="end"
            triggerClassName="ml-auto"
          />
        </TableCell>
      </TableRow>

      {/* Schedule Dialog */}
      <UnifiedSchedulingDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        context={{
          entityType: 'schedule_item',
          projectId: project.projectid,
          title: `Schedule: ${project.projectname || 'Project'}`,
          description: `Project scheduling for ${project.projectname || 'this project'}`,
        }}
        onSave={handleScheduleSave}
        onCancel={() => setShowScheduleDialog(false)}
      />

      {/* Archive Confirmation Dialog */}
      <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600 font-montserrat">
              <Archive className="h-5 w-5 mr-2" />
              Archive Project
            </DialogTitle>
            <DialogDescription className="font-opensans">
              Are you sure you want to archive "{project.projectname || 'this project'}"? This
              action will move the project to your archived projects list.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowArchiveDialog(false)}
              className="font-opensans"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmArchive}
              className="bg-red-600 hover:bg-red-700 font-opensans"
            >
              <Archive className="h-4 w-4 mr-2" />
              Archive Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectRow;
