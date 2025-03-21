
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Folder } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/components/subcontractors/utils/formatUtils';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface AssociatedProjectsProps {
  projects: any[];
  loading: boolean;
}

const AssociatedProjects: React.FC<AssociatedProjectsProps> = ({ projects, loading }) => {
  const navigate = useNavigate();

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Associated Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Loading projects...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Folder className="h-5 w-5" />
          Associated Projects
        </CardTitle>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Folder className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>No projects are associated with this subcontractor yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.projectid}>
                    <TableCell className="font-medium">{project.projectname}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {project.status?.toLowerCase() || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(project.createdon)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleProjectClick(project.projectid)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssociatedProjects;
