
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { TableCell, TableRow } from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Subcontractor, Specialty, mapStatusToStatusBadge, formatDate } from './utils/subcontractorUtils';

interface SubcontractorRowProps {
  subcontractor: Subcontractor;
  specialties: Record<string, Specialty>;
}

const SubcontractorRow = ({ subcontractor: sub, specialties }: SubcontractorRowProps) => {
  // Get specialty name by ID
  const getSpecialtyName = (id: string) => {
    return specialties[id]?.specialty || 'Unknown Specialty';
  };
  
  return (
    <TableRow key={sub.subid}>
      <TableCell>
        <div className="font-medium">{sub.subname || 'Unnamed Subcontractor'}</div>
        <div className="text-xs text-muted-foreground">{sub.subid}</div>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {sub.specialty_ids && sub.specialty_ids.length > 0 ? (
            sub.specialty_ids.map((specialtyId) => (
              <Badge key={specialtyId} variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
                {getSpecialtyName(specialtyId)}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">No specialties</span>
          )}
        </div>
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
  );
};

export default SubcontractorRow;
