import { useState } from 'react';
import { Briefcase } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { ArrowUpDown } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/common/status/StatusBadge';
import { StatusType } from '@/types/common';
import { Badge } from '@/components/ui/badge';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';
import { useNavigate } from 'react-router-dom';
import ProjectTableHeader from './components/ProjectTableHeader';
import ProjectRow from './components/ProjectRow';

export type Project = Database['public']['Tables']['projects']['Row'] & {
  customer_name?: string | null;
  work_orders_count?: number | null;
};

interface ProjectsTableProps {
  projects: Project[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
}

export const mapStatusToStatusBadge = (status: string | null | undefined): StatusType => {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'in progress':
      return 'ACTIVE';
    case 'on hold':
      return 'ON_HOLD';
    case 'completed':
      return 'COMPLETED';
    case 'cancelled':
      return 'CANCELLED';
    default:
      return 'PENDING';
  }
};

const ProjectsTable = ({ projects, loading, error, searchQuery }: ProjectsTableProps) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Project | 'customer_name' | null;
    direction: 'ascending' | 'descending';
  }>({ key: null, direction: 'ascending' });
  const navigate = useNavigate();

  // Filter projects based on search query
  const filteredProjects = projects.filter(
    project =>
      project.projectname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.projectid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sorting logic (using sortConfig.key and sortConfig.direction)
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue =
      a[sortConfig.key as keyof Project] ??
      (sortConfig.key === 'customer_name' ? a.customer_name : null);
    const bValue =
      b[sortConfig.key as keyof Project] ??
      (sortConfig.key === 'customer_name' ? b.customer_name : null);

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    let comparison = 0;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    }

    return sortConfig.direction === 'ascending' ? comparison : -comparison;
  });

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
        {sortedProjects.map(project => (
          <ProjectRow key={project.projectid} project={project} />
        ))}
      </TableBody>
    </Table>
  );
};

export default ProjectsTable;
