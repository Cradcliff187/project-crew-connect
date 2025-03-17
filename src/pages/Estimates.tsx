
import { useState } from 'react';
import { Search, FileText, Plus, Filter, MoreHorizontal, ChevronDown } from 'lucide-react';
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
import StatusBadge from '@/components/ui/StatusBadge';
import PageTransition from '@/components/layout/PageTransition';
import Header from '@/components/layout/Header';

// Sample data - In a real app, this would come from API calls
const estimatesData = [
  {
    id: 'EST-1001',
    client: 'Jackson Properties',
    project: 'Office Renovation',
    date: '2023-10-15',
    amount: 45000,
    status: 'pending' as const,
    versions: 2
  },
  {
    id: 'EST-1002',
    client: 'Vanguard Development',
    project: 'New Construction',
    date: '2023-10-12',
    amount: 72000,
    status: 'draft' as const,
    versions: 1
  },
  {
    id: 'EST-1003',
    client: 'Metro Builders',
    project: 'Warehouse Extension',
    date: '2023-10-10',
    amount: 38500,
    status: 'approved' as const,
    versions: 3
  },
  {
    id: 'EST-1004',
    client: 'Highrise Inc.',
    project: 'Skyline Tower',
    date: '2023-10-08',
    amount: 145000,
    status: 'rejected' as const,
    versions: 2
  },
  {
    id: 'EST-1005',
    client: 'Coastal Developments',
    project: 'Beach Resort',
    date: '2023-10-05',
    amount: 87500,
    status: 'approved' as const,
    versions: 1
  },
];

const Estimates = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredEstimates = estimatesData.filter(estimate => 
    estimate.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    estimate.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
    estimate.id.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h1 className="text-3xl font-semibold tracking-tight">Estimates</h1>
            <p className="text-muted-foreground">
              Create and manage your project estimates
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 animate-in" style={{ animationDelay: '0.1s' }}>
            <div className="relative w-full md:w-auto flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search estimates..." 
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
                New Estimate
              </Button>
            </div>
          </div>
          
          <div className="premium-card animate-in" style={{ animationDelay: '0.2s' }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estimate #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Versions</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEstimates.map((estimate) => (
                  <TableRow key={estimate.id}>
                    <TableCell className="font-medium">{estimate.id}</TableCell>
                    <TableCell>{estimate.client}</TableCell>
                    <TableCell>{estimate.project}</TableCell>
                    <TableCell>{formatDate(estimate.date)}</TableCell>
                    <TableCell>${estimate.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <StatusBadge status={estimate.status} />
                    </TableCell>
                    <TableCell>{estimate.versions}</TableCell>
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
                          <DropdownMenuItem>Edit estimate</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem>Create new version</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Convert to project</DropdownMenuItem>
                          <DropdownMenuItem>Download PDF</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEstimates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                      <p>No estimates found. Create your first estimate!</p>
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

export default Estimates;
