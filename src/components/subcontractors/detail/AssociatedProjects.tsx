
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ExternalLink, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Project {
  projectid: string;
  projectname: string;
  status: string;
  createdon: string;
}

interface AssociatedProjectsProps {
  projects: Project[];
  loading: boolean;
  showFullTable?: boolean;
}

const AssociatedProjects = ({ projects, loading, showFullTable = false }: AssociatedProjectsProps) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-[#0485ea]" />
        <p className="mt-2 text-sm text-muted-foreground">Loading associated projects...</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-base font-medium mb-4">Associated Projects</h3>
      
      {projects.length === 0 ? (
        <p className="text-muted-foreground text-sm">No projects associated with this subcontractor.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Status</TableHead>
                {showFullTable && <TableHead>Created On</TableHead>}
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.slice(0, showFullTable ? undefined : 5).map((project) => (
                <TableRow key={project.projectid}>
                  <TableCell>{project.projectname}</TableCell>
                  <TableCell>
                    <span className="capitalize">{project.status?.toLowerCase() || 'Unknown'}</span>
                  </TableCell>
                  {showFullTable && <TableCell>{formatDate(project.createdon)}</TableCell>}
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/projects/${project.projectid}`}>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {!showFullTable && projects.length > 5 && (
            <div className="mt-2 text-right">
              <Button variant="link" size="sm" className="text-[#0485ea]">
                View all {projects.length} projects
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssociatedProjects;
