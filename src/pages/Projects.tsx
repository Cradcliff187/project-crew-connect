
import { useState, useEffect } from 'react';
import { Search, Briefcase, Plus, Filter, MoreHorizontal, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import StatusBadge from '@/components/ui/StatusBadge';
import PageTransition from '@/components/layout/PageTransition';
import Header from '@/components/layout/Header';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// Define project type based on our database schema
interface Project {
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

// Map database status to StatusBadge component status
const mapStatusToStatusBadge = (status: string | null) => {
  const statusMap: Record<string, "active" | "pending" | "completed" | "cancelled" | "unknown"> = {
    "active": "active",
    "pending": "pending",
    "completed": "completed",
    "cancelled": "cancelled",
    "new": "pending",
    "in_progress": "active",
    "on_hold": "pending",
    "archived": "cancelled"
  };
  
  if (!status) return "unknown";
  
  const lowercaseStatus = status.toLowerCase();
  return statusMap[lowercaseStatus] || "unknown";
};

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch projects from Supabase
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('projectid, projectname, customername, customerid, status, createdon')
          .order('createdon', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // Transform data to match our UI requirements
        const projectsWithDefaults = data.map(project => ({
          ...project,
          // Default values for fields not yet in database
          budget: Math.floor(Math.random() * 200000) + 50000, // Temporary random budget
          spent: Math.floor(Math.random() * 150000), // Temporary random spent amount
          progress: Math.floor(Math.random() * 100), // Temporary random progress
        }));
        
        setProjects(projectsWithDefaults);
      } catch (error: any) {
        console.error('Error fetching projects:', error);
        setError(error.message);
        toast({
          title: 'Error fetching projects',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);
  
  // Filter projects based on search query
  const filteredProjects = projects.filter(project => 
    (project.projectname?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (project.customername?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (project.projectid?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };
  
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <div className="flex flex-col gap-2 mb-6 animate-in">
            <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              Manage your active and completed projects
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 animate-in" style={{ animationDelay: '0.1s' }}>
            <div className="relative w-full md:w-auto flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search projects..." 
                className="pl-9 subtle-input rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4 mr-1" />
                Filter
                <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
              </Button>
              <Button size="sm" className="flex-1 md:flex-auto bg-[#0485ea] hover:bg-[#0375d1]">
                <Plus className="h-4 w-4 mr-1" />
                New Project
              </Button>
            </div>
          </div>
          
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
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      <Briefcase className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                      <p>No projects found. Create your first project!</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects.map((project) => (
                    <TableRow key={project.projectid}>
                      <TableCell>
                        <div className="font-medium">{project.projectname || 'Unnamed Project'}</div>
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
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View details</DropdownMenuItem>
                            <DropdownMenuItem>Edit project</DropdownMenuItem>
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
        </main>
      </div>
    </PageTransition>
  );
};

export default Projects;
