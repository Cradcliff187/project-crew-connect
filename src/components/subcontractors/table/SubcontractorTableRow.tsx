
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Tag } from 'lucide-react';
import { getStatusColor } from '../utils/statusUtils';
import { Subcontractor } from '../utils/types';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import useSpecialties from '../hooks/useSpecialties';

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
  const { specialties, loading } = useSpecialties();
  
  const handleView = () => {
    onViewDetails(subcontractor);
  };
  
  const handleEdit = () => {
    if (onEditSubcontractor) {
      onEditSubcontractor(subcontractor);
    }
  };
  
  // Function to render specialties as badges
  const renderSpecialties = () => {
    if (loading) {
      return <span className="text-xs text-muted-foreground">Loading...</span>;
    }
    
    if (!subcontractor.specialty_ids || subcontractor.specialty_ids.length === 0) {
      return <span className="text-gray-400 italic">No specialties</span>;
    }
    
    // Show up to 2 specialties, with a count badge if more exist
    const specialtiesToShow = subcontractor.specialty_ids.slice(0, 2);
    const remainingCount = subcontractor.specialty_ids.length - 2;
    
    return (
      <div className="flex flex-wrap gap-1">
        {specialtiesToShow.map(id => {
          const specialty = specialties[id];
          return specialty ? (
            <Badge 
              key={id} 
              variant="secondary" 
              className="text-xs bg-[#f0f7fe] text-[#0485ea] border-[#dcedfd] whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]"
            >
              {specialty.specialty}
            </Badge>
          ) : null;
        })}
        
        {remainingCount > 0 && (
          <Badge 
            variant="outline" 
            className="text-xs flex items-center gap-1"
          >
            <Tag className="h-3 w-3" />
            +{remainingCount} more
          </Badge>
        )}
      </div>
    );
  };
  
  return (
    <TableRow key={subcontractor.subid} className="hover:bg-[#0485ea]/5 transition-colors">
      <TableCell className="font-medium">
        <Link to={`/subcontractors/${subcontractor.subid}`} className="text-[#0485ea] hover:underline">
          {subcontractor.subname}
        </Link>
      </TableCell>
      <TableCell>
        {renderSpecialties()}
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
        {subcontractor.rating !== undefined && subcontractor.rating !== null ? (
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
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white shadow-md">
              <DropdownMenuItem onClick={handleView}>
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
