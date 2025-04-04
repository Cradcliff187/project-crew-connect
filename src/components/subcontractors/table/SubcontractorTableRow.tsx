
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';
import { Subcontractor } from '../utils/types';
import { Link } from 'react-router-dom';
import useSpecialties from '../hooks/useSpecialties';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';
import { Edit, Trash2, Eye, Phone, History, Calendar } from 'lucide-react';

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
  
  // Handle view click
  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails(subcontractor);
  };

  // Handle edit click
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditSubcontractor) {
      onEditSubcontractor(subcontractor);
    }
  };

  // Handle delete click
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Delete subcontractor', subcontractor.subid);
  };

  // Handle row click
  const handleRowClick = () => {
    onViewDetails(subcontractor);
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

  // Get action menu groups
  const getSubcontractorActions = (): ActionGroup[] => {
    return [
      {
        // Primary actions
        items: [
          {
            label: 'View details',
            icon: <Eye className="h-4 w-4" />,
            onClick: handleViewClick
          },
          {
            label: 'Edit subcontractor',
            icon: <Edit className="h-4 w-4" />,
            onClick: handleEditClick
          }
        ]
      },
      {
        // Subcontractor specific actions
        items: [
          {
            label: 'Assign to project',
            icon: <Calendar className="h-4 w-4" />,
            onClick: (e) => {
              e.stopPropagation();
              console.log('Assign to project');
            }
          },
          {
            label: 'Call subcontractor',
            icon: <Phone className="h-4 w-4" />,
            onClick: (e) => {
              e.stopPropagation();
              console.log('Call subcontractor');
            }
          },
          {
            label: 'Payment history',
            icon: <History className="h-4 w-4" />,
            onClick: (e) => {
              e.stopPropagation();
              console.log('Payment history');
            }
          }
        ]
      },
      {
        // Destructive actions
        items: [
          {
            label: 'Delete subcontractor',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: handleDeleteClick,
            className: 'text-red-600'
          }
        ]
      }
    ];
  };
  
  return (
    <TableRow onClick={handleRowClick} className="cursor-pointer hover:bg-[#0485ea]/5 transition-colors">
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
        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-${
            subcontractor.status === "ACTIVE" ? "green" : "gray"
          }-100 text-${
            subcontractor.status === "ACTIVE" ? "green" : "gray"
          }-800 border-${
            subcontractor.status === "ACTIVE" ? "green" : "gray"
          }-200`}>
          {subcontractor.status || "Pending"}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end">
          <ActionMenu groups={getSubcontractorActions()} />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default SubcontractorTableRow;
