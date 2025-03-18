
import { Hammer, MoreHorizontal } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
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

// Define subcontractor type based on our database schema
export interface Subcontractor {
  subid: string;
  subname: string | null;
  contactemail: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  status: string | null;
  created_at: string | null;
}

interface SubcontractorsTableProps {
  subcontractors: Subcontractor[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
}

// Map database status to StatusBadge component status
export const mapStatusToStatusBadge = (status: string | null): StatusType => {
  const statusMap: Record<string, StatusType> = {
    "ACTIVE": "active",
    "INACTIVE": "inactive",
    "QUALIFIED": "qualified",
    "PENDING": "pending",
    "REJECTED": "on-hold"
  };
  
  if (!status) return "unknown";
  
  return statusMap[status] || "unknown";
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

const SubcontractorsTable = ({ subcontractors, loading, error, searchQuery }: SubcontractorsTableProps) => {
  // Filter subcontractors based on search query
  const filteredSubcontractors = subcontractors.filter(sub => 
    (sub.subname?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (sub.contactemail?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (sub.subid?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div className="premium-card animate-in" style={{ animationDelay: '0.2s' }}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subcontractor</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Added</TableHead>
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
                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
              </TableRow>
            ))
          ) : error ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-red-500">
                <p>Error loading subcontractors: {error}</p>
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
          ) : filteredSubcontractors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                <Hammer className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                <p>No subcontractors found. Add your first subcontractor!</p>
              </TableCell>
            </TableRow>
          ) : (
            filteredSubcontractors.map((sub) => (
              <TableRow key={sub.subid}>
                <TableCell>
                  <div className="font-medium">{sub.subname || 'Unnamed Subcontractor'}</div>
                  <div className="text-xs text-muted-foreground">{sub.subid}</div>
                </TableCell>
                <TableCell>
                  <div>{sub.contactemail || 'No Email'}</div>
                  <div className="text-xs text-muted-foreground">{sub.phone || 'No Phone'}</div>
                </TableCell>
                <TableCell>
                  {sub.city && sub.state ? (
                    <div>{sub.city}, {sub.state}</div>
                  ) : (
                    <div className="text-muted-foreground">No Location</div>
                  )}
                </TableCell>
                <TableCell>{formatDate(sub.created_at)}</TableCell>
                <TableCell>
                  <StatusBadge status={mapStatusToStatusBadge(sub.status)} />
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
                      <DropdownMenuItem>Edit subcontractor</DropdownMenuItem>
                      <DropdownMenuItem>Work history</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Specialties</DropdownMenuItem>
                      <DropdownMenuItem>Insurance info</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">Deactivate</DropdownMenuItem>
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

export default SubcontractorsTable;
