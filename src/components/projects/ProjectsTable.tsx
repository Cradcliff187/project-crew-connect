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
import { EmptyState } from '@/components/ui/empty-state';
import { TableLoading } from '@/components/ui/table-loading';

// Adjust type to match fetched and calculated data
export type Project = {
  projectid: string;
  projectname: string | null;
  status: string | null;
  created_at: string; // Base type has this
  createdon?: string; // Alias added in fetchProjects
  customerid: string | null;
  total_budget: number | null; // Represents Est. Revenue / Contract Value
  current_expenses: number | null;
  original_base_cost: number | null; // Added fetch
  total_estimated_cost_budget?: number; // Calculated in fetchProjects
  customername?: string | null; // Added via join/transform
  progress?: number; // Added via join/transform
  // Add any other fields from the 'projects' table if they are explicitly used downstream
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
      project.customername?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sorting logic (using sortConfig.key and sortConfig.direction)
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue =
      a[sortConfig.key as keyof Project] ??
      (sortConfig.key === 'customer_name' ? a.customername : null);
    const bValue =
      b[sortConfig.key as keyof Project] ??
      (sortConfig.key === 'customer_name' ? b.customername : null);

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
    return <TableLoading rowCount={5} />;
  }

  // Empty state when no projects found
  if (filteredProjects.length === 0) {
    return (
      <EmptyState
        icon={<Briefcase className="h-12 w-12 text-muted-foreground/50" />}
        title="No projects found"
        description={
          searchQuery ? 'Try changing your search query.' : 'Create a new project to get started.'
        }
      />
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
