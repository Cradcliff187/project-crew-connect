
import { Briefcase } from 'lucide-react';
import { Table, TableBody } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { StatusType } from '@/types/common';
import ProjectTableHeader from './components/ProjectTableHeader';
import ProjectRow from './components/ProjectRow';

// Define project type based on our database schema
export interface Project {
  projectid: string;
  projectname: string;
  customername: string;
  createdon: string;
  status: string;
  // Budget and financial fields to be added in future updates
  budget?: number;
  spent?: number;
  progress?: number;
}

interface ProjectsTableProps {
  projects: Project[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
}

// Map database status to StatusBadge component status
export const mapStatusToStatusBadge = (status: string | null): StatusType => {
  const statusMap: Record<string, StatusType> = {
    active: 'ACTIVE',
    pending: 'PENDING',
    completed: 'COMPLETED',
    cancelled: 'CANCELLED',
    unknown: 'unknown',
    new: 'PENDING',
    in_progress: 'ACTIVE',
    on_hold: 'ON_HOLD',
    archived: 'INACTIVE',
  };

  if (!status) return 'unknown';

  const lowercaseStatus = status.toLowerCase();
  return statusMap[lowercaseStatus] || 'unknown';
};

export const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const ProjectsTable = ({ projects, loading, error, searchQuery }: ProjectsTableProps) => {
  // Filter projects based on search query
  const filteredProjects = projects.filter(
    project =>
      (project.projectname?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (project.customername?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (project.projectid?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  // Handle error state
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load projects: {error}</AlertDescription>
      </Alert>
    );
  }

  // Handle loading state
  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  // Empty state when no projects found
  if (filteredProjects.length === 0) {
    return (
      <div className="text-center py-10">
        <Briefcase className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
        <h3 className="text-lg font-medium text-gray-600">No projects found</h3>
        <p className="text-sm text-gray-500 mt-2">
          {searchQuery ? 'Try changing your search query.' : 'Create a new project to get started.'}
        </p>
      </div>
    );
  }

  return (
    <Table className="border rounded-md">
      <ProjectTableHeader />
      <TableBody>
        {filteredProjects.map(project => (
          <ProjectRow key={project.projectid} project={project} />
        ))}
      </TableBody>
    </Table>
  );
};

export default ProjectsTable;
