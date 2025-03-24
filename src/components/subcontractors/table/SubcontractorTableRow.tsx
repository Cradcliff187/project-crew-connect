
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Edit, MoreHorizontal } from 'lucide-react';
import { getStatusColor } from '../utils/statusUtils';
import { Subcontractor } from '../utils/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SubcontractorTableRowProps {
  subcontractor: Subcontractor;
  onViewDetails: (subcontractor: Subcontractor) => void;
  onEditSubcontractor?: (subcontractor: Subcontractor) => void;
}

const SubcontractorTableRow = ({ 
  subcontractor, 
  onViewDetails, 
  onEditSubcontractor 
}: SubcontractorTableRowProps) => {
  
  const handleEdit = () => {
    if (onEditSubcontractor) {
      onEditSubcontractor(subcontractor);
    }
  };
  
  return (
    <TableRow key={subcontractor.subid} className="hover:bg-muted/50">
      <TableCell className="font-medium">{subcontractor.subname}</TableCell>
      <TableCell>
        {subcontractor.contactemail && (
          <div className="text-sm">{subcontractor.contactemail}</div>
        )}
        {subcontractor.phone && (
          <div className="text-sm text-muted-foreground">{subcontractor.phone}</div>
        )}
      </TableCell>
      <TableCell>
        {subcontractor.city && subcontractor.state
          ? `${subcontractor.city}, ${subcontractor.state}`
          : subcontractor.city || subcontractor.state || '-'}
      </TableCell>
      <TableCell>
        <div
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(
            subcontractor.status || "PENDING"
          )}`}
        >
          {subcontractor.status || "Pending"}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(subcontractor)}
            className="text-[#0485ea] hover:bg-[#0485ea]/10"
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white shadow-md">
              <DropdownMenuItem onClick={() => onViewDetails(subcontractor)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                Edit Subcontractor
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default SubcontractorTableRow;
