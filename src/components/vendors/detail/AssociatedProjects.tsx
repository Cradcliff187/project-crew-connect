import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Link, useNavigate } from 'react-router-dom';
import { VendorProject } from './types';

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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Associated Projects</CardTitle>
      </CardHeader>
      <CardContent>
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
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleViewProject(project)}
                >
                  <TableCell>
                    <Link
                      to={`/projects/${project.projectid}`}
                      className="text-[#0485ea] hover:underline"
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
          <div>No associated projects found.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssociatedProjects;
