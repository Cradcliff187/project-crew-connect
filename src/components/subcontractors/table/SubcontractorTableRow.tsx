
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, MoreHorizontal } from 'lucide-react';
import { getStatusColor } from '../utils/statusUtils';
import { Subcontractor } from '../utils/types';
import { Link } from 'react-router-dom';
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
    <TableRow key={subcontractor.subid} className="hover:bg-[#0485ea]/5 transition-colors">
      <TableCell className="font-medium">
        <Link to={`/subcontractors/${subcontractor.subid}`} className="text-[#0485ea] hover:underline">
          {subcontractor.subname}
        </Link>
      </TableCell>
      <TableCell>
        {subcontractor.specialty_ids && subcontractor.specialty_ids.length > 0 ? (
          <span className="text-sm">{subcontractor.specialty_ids.length} specialties</span>
        ) : (
          <span className="text-gray-400 italic">No specialties</span>
        )}
      </TableCell>
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
        {subcontractor.rating ? (
          <span className="text-sm">{subcontractor.rating}/5 rating</span>
        ) : (
          <span className="text-gray-400 italic">No rating</span>
        )}
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
