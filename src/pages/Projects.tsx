
import { useState } from 'react';
import { Search, Briefcase, Plus, Filter, MoreHorizontal, ChevronDown } from 'lucide-react';
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

// Sample data - In a real app, this would come from API calls
const projectsData = [
  {
    id: 'PR-2001',
    name: 'Lakeside Project',
    client: 'Jackson Properties',
    startDate: '2023-09-15',
    endDate: '2023-12-15',
    budget: 120000,
    spent: 82000,
    progress: 68,
    status: 'active' as const
  },
  {
    id: 'PR-2002',
    name: 'City Center Renovation',
    client: 'Metro Builders',
    startDate: '2023-09-01',
    endDate: '2024-01-30',
    budget: 200000,
    spent: 64000,
    progress: 32,
    status: 'active' as const
  },
  {
    id: 'PR-2003',
    name: 'Hillside Residence',
    client: 'Private Client',
    startDate: '2023-07-10',
    endDate: '2023-10-10',
    budget: 85000,
    spent: 85000,
    progress: 100,
    status: 'completed' as const
  },
  {
    id: 'PR-2004',
    name: 'Commercial Complex',
    client: 'Vanguard Development',
    startDate: '2023-10-01',
    endDate: '2024-05-30',
    budget: 350000,
    spent: 52500,
    progress: 15,
    status: 'on-hold' as const
  },
  {
    id: 'PR-2005',
    name: 'Beach Resort',
    client: 'Coastal Developments',
    startDate: '2023-08-20',
    endDate: '2024-03-15',
    budget: 250000,
    spent: 110000,
    progress: 44,
    status: 'active' as const
  },
];

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredProjects = projectsData.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const formatDate = (dateString: string) => {
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
              <Button size="sm" className="flex-1 md:flex-auto btn-premium">
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
                  <TableHead>Timeline</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div className="font-medium">{project.name}</div>
                      <div className="text-xs text-muted-foreground">{project.id}</div>
                    </TableCell>
                    <TableCell>{project.client}</TableCell>
                    <TableCell>
                      <div>{formatDate(project.startDate)}</div>
                      <div>to {formatDate(project.endDate)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${project.spent.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">of ${project.budget.toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress value={project.progress} className="h-2 w-[100px]" />
                        <span className="text-sm text-muted-foreground">{project.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={project.status} />
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
                ))}
                {filteredProjects.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      <Briefcase className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                      <p>No projects found. Create your first project!</p>
                    </TableCell>
                  </TableRow>
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
