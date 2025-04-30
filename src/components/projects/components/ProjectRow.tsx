import React from 'react';
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

  const handleViewDetails = () => {
    navigate(`/projects/${project.projectid}`);
  };

  const handleEditProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/projects/${project.projectid}/edit`);
  };

  const actionGroups: ActionGroup[] = [
    {
      items: [
        {
          label: 'View details',
          icon: <Eye className="w-4 h-4" />,
          onClick: () => handleViewDetails(),
          className: 'text-primary hover:text-primary/80',
        },
        {
          label: 'Edit project',
          icon: <Edit className="w-4 h-4" />,
          onClick: e => handleEditProject(e),
        },
      ],
    },
    {
      items: [
        {
          label: 'Schedule',
          icon: <Calendar className="w-4 h-4" />,
          onClick: () => console.log('Schedule project', project.projectid),
        },
        {
          label: 'View time logs',
          icon: <Clock className="w-4 h-4" />,
          onClick: () => console.log('View time logs', project.projectid),
        },
      ],
    },
    {
      items: [
        {
          label: 'Generate report',
          icon: <FileText className="w-4 h-4" />,
          onClick: () => console.log('Generate report', project.projectid),
        },
        {
          label: 'Archive project',
          icon: <Archive className="w-4 h-4" />,
          onClick: () => console.log('Archive project', project.projectid),
          className: 'text-destructive hover:text-destructive/80',
        },
      ],
    },
  ];

  const budgetValue = project.total_budget ?? 0;
  const spentValue = project.current_expenses ?? 0;
  const progressValue =
    project.progress ?? (budgetValue > 0 ? Math.round((spentValue / budgetValue) * 100) : 0);

  return (
    <TableRow
      key={project.projectid}
      className="hover:bg-primary/5 transition-colors cursor-pointer"
      onClick={handleViewDetails}
    >
      <TableCell>
        <div className="font-medium text-primary">{project.projectname || 'Unnamed Project'}</div>
        <div className="text-xs text-muted-foreground">{project.projectid}</div>
      </TableCell>
      <TableCell>{project.customername || 'No Client'}</TableCell>
      <TableCell>{formatDate(project.created_at)}</TableCell>
      <TableCell>
        <div className="font-medium">{formatCurrency(spentValue)}</div>
        <div className="text-xs text-muted-foreground">
          of {formatCurrency(project.total_estimated_cost_budget ?? 0)}
        </div>
      </TableCell>
      <TableCell className="text-right">{formatCurrency(budgetValue)}</TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Progress value={progressValue} className="h-2 w-[100px]" />
          <span className="text-sm text-muted-foreground">{progressValue}%</span>
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
  );
};

export default ProjectRow;
