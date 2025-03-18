import { useNavigate } from 'react-router-dom';
import { Briefcase, MoreHorizontal } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import StatusBadge from '@/components/ui/StatusBadge';
import { StatusType } from '@/types/common';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

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
    "active": "active",
    "pending": "pending",
    "completed": "completed",
    "cancelled": "cancelled",
    "unknown": "unknown",
    "new": "pending",
    "in_progress": "active",
    "on_hold": "on-hold",
    "archived": "inactive"
  };
  
  if (!status) return "unknown";
  
  const lowercaseStatus = status.toLowerCase();
  return statusMap[lowercaseStatus] || "unknown";
};

export const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  }).format(date);
};

const ProjectsTable = ({ projects, loading, error, searchQuery }: ProjectsTableProps) => {
  const navigate = useNavigate();
  
  // Filter projects based on search query
  const filteredProjects = projects.filter(project => 
    (project.projectname?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (project.customername?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (project.projectid?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );
  
  const handleViewDetails = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };
  
  const handleEditProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click from triggering
    navigate(`/projects/${projectId}/edit`);
  };

  return (
    <div className="premium-card animate-in" style={{ animationDelay: '0.2s' }}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            // Loading state - show skeleton rows
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-3 w-[80px]" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-2 w-[100px]" />
                    <Skeleton className="h-4 w-[30px]" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
              </TableRow>
            ))
          ) : error ? (
            // Error state
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-red-500">
                <p>Error loading projects: {error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </TableCell>
            </TableRow>
          ) : filteredProjects.length === 0 ? (
            // Empty state
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                <p>No projects found. Create your first project!</p>
              </TableCell>
            </TableRow>
          ) : (
            filteredProjects.map((project) => (
              <TableRow 
                key={project.projectid}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleViewDetails(project.projectid)}
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
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(project.projectid)}>
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => handleEditProject(project.projectid, e)}>
                        Edit project
                      </DropdownMenuItem>
                      <DropdownMenuItem>Schedule</DropdownMenuItem>
                      <DropdownMenuItem>View time logs</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Generate report</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">Archive project</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProjectsTable;
