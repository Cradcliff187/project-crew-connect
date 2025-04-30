import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Link, useNavigate } from 'react-router-dom';
import { VendorProject } from './types';
import { Briefcase } from 'lucide-react';

interface AssociatedProjectsProps {
  projects: VendorProject[];
  loading: boolean;
}

const AssociatedProjects: React.FC<AssociatedProjectsProps> = ({ projects, loading }) => {
  const navigate = useNavigate();

  const handleViewProject = (project: VendorProject) => {
    navigate(`/projects/${project.projectid}`);
  };

  // Format date function to safely handle null/undefined dates
  const formatDate = (date?: string | null) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
        <Briefcase className="h-5 w-5" />
        Associated Projects
      </h3>

      {loading ? (
        <div>Loading projects...</div>
      ) : projects.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Project Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map(project => (
              <TableRow
                key={project.projectid}
                className="cursor-pointer hover:bg-primary/5"
                onClick={() => handleViewProject(project)}
              >
                <TableCell>
                  <Link
                    to={`/projects/${project.projectid}`}
                    className="text-primary hover:underline"
                  >
                    {project.projectname || 'Unnamed Project'}
                  </Link>
                </TableCell>
                <TableCell>{project.status || 'Unknown'}</TableCell>
                <TableCell>{formatDate(project.createdon)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-muted-foreground italic">No associated projects found.</div>
      )}
    </div>
  );
};

export default AssociatedProjects;
