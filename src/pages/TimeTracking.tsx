
import { useState } from 'react';
import { Search, Clock, Plus, Filter, MoreHorizontal, Calendar, ChevronDown, Play, Pause, Timer, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PageTransition from '@/components/layout/PageTransition';
import PageHeader from '@/components/layout/PageHeader';
import DashboardCard from '@/components/dashboard/DashboardCard';

// Sample data - In a real app, this would come from API calls
const timeEntriesData = [
  {
    id: 'TE-001',
    user: 'John Smith',
    project: 'Lakeside Project',
    task: 'Electrical Installation',
    date: '2023-10-15',
    hours: 8.5,
    status: 'approved',
    notes: 'Completed wiring for east wing'
  },
  {
    id: 'TE-002',
    user: 'Sarah Johnson',
    project: 'City Center Renovation',
    task: 'Plumbing',
    date: '2023-10-15',
    hours: 6.0,
    status: 'pending',
    notes: 'Installed new pipes in bathrooms'
  },
  {
    id: 'TE-003',
    user: 'Mike Wilson',
    project: 'Commercial Complex',
    task: 'Framing',
    date: '2023-10-14',
    hours: 7.5,
    status: 'approved',
    notes: 'Framed walls on 2nd floor'
  },
  {
    id: 'TE-004',
    user: 'Jessica Brown',
    project: 'Lakeside Project',
    task: 'Interior Design',
    date: '2023-10-14',
    hours: 5.0,
    status: 'pending',
    notes: 'Client meeting and design revisions'
  },
  {
    id: 'TE-005',
    user: 'David Miller',
    project: 'Beach Resort',
    task: 'Excavation',
    date: '2023-10-13',
    hours: 9.0,
    status: 'approved',
    notes: 'Pool area excavation completed'
  },
];

const TimeTracking = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [timerRunning, setTimerRunning] = useState(false);
  
  const filteredEntries = timeEntriesData.filter(entry => 
    entry.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.user.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };
  
  const formatHours = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };
  
  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  };
  
  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <PageHeader
          title="Time Tracking"
          description="Log and manage time for employees and projects"
        >
          <div className="relative w-full md:w-auto flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search entries..." 
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
            <Button 
              size="sm" 
              className="flex-1 md:flex-auto bg-[#0485ea] hover:bg-[#0375d1]"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Entry
            </Button>
          </div>
        </PageHeader>
        
        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 animate-in" style={{ animationDelay: '0.1s' }}>
              <DashboardCard
                title="Quick Timer"
                icon={<Timer className="h-5 w-5" />}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Project</label>
                      <Select defaultValue="lakeside">
                        <SelectTrigger className="subtle-input">
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lakeside">Lakeside Project</SelectItem>
                          <SelectItem value="city-center">City Center Renovation</SelectItem>
                          <SelectItem value="commercial">Commercial Complex</SelectItem>
                          <SelectItem value="beach-resort">Beach Resort</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Task</label>
                      <Select defaultValue="electrical">
                        <SelectTrigger className="subtle-input">
                          <SelectValue placeholder="Select task" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="electrical">Electrical Installation</SelectItem>
                          <SelectItem value="plumbing">Plumbing</SelectItem>
                          <SelectItem value="framing">Framing</SelectItem>
                          <SelectItem value="design">Interior Design</SelectItem>
                          <SelectItem value="excavation">Excavation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes (optional)</label>
                    <Input className="subtle-input" placeholder="What are you working on?" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-mono font-medium">00:00:00</div>
                    <div className="space-x-2">
                      <Button 
                        variant={timerRunning ? "destructive" : "default"}
                        size="sm"
                        className={!timerRunning ? "btn-premium" : ""}
                        onClick={toggleTimer}
                      >
                        {timerRunning ? (
                          <>
                            <Pause className="h-4 w-4 mr-1" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            Start Timer
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm">
                        Manual Entry
                      </Button>
                    </div>
                  </div>
                </div>
              </DashboardCard>
            </div>
            
            <div className="animate-in" style={{ animationDelay: '0.15s' }}>
              <DashboardCard
                title="Weekly Summary"
                icon={<Calendar className="h-5 w-5" />}
              >
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Total Hours This Week</div>
                    <div className="text-4xl font-bold mt-1">36.0</div>
                    <div className="text-xs text-green-600 mt-1">+4.5 hours from last week</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Lakeside Project</span>
                      <span className="font-medium">14.5h</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-construction-500" style={{ width: '40%' }}></div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>City Center Renovation</span>
                      <span className="font-medium">10.0h</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-construction-500" style={{ width: '28%' }}></div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Commercial Complex</span>
                      <span className="font-medium">7.5h</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-construction-500" style={{ width: '21%' }}></div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Beach Resort</span>
                      <span className="font-medium">4.0h</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-construction-500" style={{ width: '11%' }}></div>
                    </div>
                  </div>
                </div>
              </DashboardCard>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 animate-in" style={{ animationDelay: '0.2s' }}>
            <Tabs defaultValue="list" className="w-full">
              <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
                <TabsList>
                  <TabsTrigger value="list" className="flex items-center gap-1">
                    <List className="h-4 w-4" />
                    List View
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Calendar View
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="list" className="mt-0">
                <div className="premium-card">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Project & Task</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[60px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{formatDate(entry.date)}</TableCell>
                          <TableCell>{entry.user}</TableCell>
                          <TableCell>
                            <div className="font-medium">{entry.project}</div>
                            <div className="text-xs text-muted-foreground">{entry.task}</div>
                          </TableCell>
                          <TableCell className="font-medium">{formatHours(entry.hours)}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{entry.notes}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              entry.status === 'approved' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {entry.status === 'approved' ? 'Approved' : 'Pending'}
                            </span>
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
                                <DropdownMenuItem>Edit entry</DropdownMenuItem>
                                <DropdownMenuItem>Approve</DropdownMenuItem>
                                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredEntries.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                            <Clock className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                            <p>No time entries found. Start tracking time!</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="calendar" className="mt-0">
                <div className="premium-card p-6 flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-medium mb-2">Calendar View Coming Soon</h3>
                    <p className="text-muted-foreground max-w-md">
                      The calendar view for time tracking is under development. In the meantime, you can use the list view to manage your time entries.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default TimeTracking;
