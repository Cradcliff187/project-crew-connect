
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { formatDate } from '@/lib/utils';
import { Eye, Edit, Calendar, Clock, FileText, Archive } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Project } from '../ProjectsTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { mapStatusToStatusBadge } from '../ProjectsTable';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';

interface ProjectRowProps {
  project: Project;
}

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
          className: "text-[#0485ea] hover:text-[#0375d1]"
        },
        {
          label: 'Edit project',
          icon: <Edit className="w-4 h-4" />,
          onClick: (e) => handleEditProject(e),
          className: "text-gray-600 hover:text-gray-800"
        }
      ]
    },
    {
      items: [
        {
          label: 'Schedule',
          icon: <Calendar className="w-4 h-4" />,
          onClick: () => console.log('Schedule project', project.projectid),
          className: "text-gray-600 hover:text-gray-800"
        },
        {
          label: 'View time logs',
          icon: <Clock className="w-4 h-4" />,
          onClick: () => console.log('View time logs', project.projectid),
          className: "text-gray-600 hover:text-gray-800"
        }
      ]
    },
    {
      items: [
        {
          label: 'Generate report',
          icon: <FileText className="w-4 h-4" />,
          onClick: () => console.log('Generate report', project.projectid),
          className: "text-gray-600 hover:text-gray-800"
        },
        {
          label: 'Archive project',
          icon: <Archive className="w-4 h-4" />,
          onClick: () => console.log('Archive project', project.projectid),
          className: "text-red-600 hover:text-red-800"
        }
      ]
    }
  ];

  return (
    <TableRow 
      key={project.projectid} 
      className="hover:bg-[#0485ea]/5 transition-colors cursor-pointer"
      onClick={handleViewDetails}
    >
      <TableCell>
        <div className="font-medium text-[#0485ea]">{project.projectname || 'Unnamed Project'}</div>
        <div className="text-xs text-muted-foreground">{project.projectid}</div>
      </TableCell>
      <TableCell>{project.customername || 'No Client'}</TableCell>
      <TableCell>{formatDate(project.createdon)}</TableCell>
      <TableCell>
        <div className="font-medium">${project.spent?.toLocaleString() || '0'}</div>
        <div className="text-xs text-muted-foreground">of ${project.budget?.toLocaleString() || '0'}</div>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Progress value={project.progress || 0} className="h-2 w-[100px]" />
          <span className="text-sm text-muted-foreground">{project.progress || 0}%</span>
        </div>
      </TableCell>
      <TableCell>
        <StatusBadge status={mapStatusToStatusBadge(project.status)} />
      </TableCell>
      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
        <ActionMenu 
          groups={actionGroups} 
          size="sm" 
          align="end"
          triggerClassName="ml-auto"
        />
      </TableCell>
    </TableRow>
  );
};

export default ProjectRow;
