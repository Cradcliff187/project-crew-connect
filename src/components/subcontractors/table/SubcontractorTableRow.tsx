import { TableRow, TableCell } from '@/components/ui/table';
import { Mail, Phone, Edit, Trash2, Eye, MapPin } from 'lucide-react';
import { Subcontractor } from '../utils/types';
import { Link } from 'react-router-dom';
import useSpecialties from '../hooks/useSpecialties';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';
import StatusBadge from '@/components/ui/StatusBadge';

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

  // Handle call click
  const handleCallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (subcontractor.phone) {
      window.location.href = `tel:${subcontractor.phone}`;
    }
  };

  // Handle email click
  const handleEmailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (subcontractor.contactemail) {
      window.location.href = `mailto:${subcontractor.contactemail}`;
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

  // Get appropriate status type for the badge
  const getStatusType = (status: string | null) => {
    if (!status) return 'neutral';
    
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'neutral';
      case 'APPROVED':
        return 'info';
      case 'POTENTIAL':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  // Get simplified action menu groups with standardized actions
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
        // Contact actions
        items: [
          {
            label: 'Call subcontractor',
            icon: <Phone className="h-4 w-4" />,
            onClick: handleCallClick,
            disabled: !subcontractor.phone
          },
          {
            label: 'Email subcontractor',
            icon: <Mail className="h-4 w-4" />,
            onClick: handleEmailClick,
            disabled: !subcontractor.contactemail
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
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{subcontractor.subname}</span>
          <span className="text-xs text-muted-foreground">{subcontractor.subid}</span>
        </div>
      </TableCell>
      <TableCell>
        {renderSpecialties()}
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          {subcontractor.contactemail && (
            <div className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm">{subcontractor.contactemail}</span>
            </div>
          )}
          {subcontractor.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm">{subcontractor.phone}</span>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-start gap-1">
          <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <span className="text-sm">
            {subcontractor.city && subcontractor.state
              ? `${subcontractor.city}, ${subcontractor.state}`
              : subcontractor.city || subcontractor.state || 'No location information'}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <StatusBadge 
          status={getStatusType(subcontractor.status)}
          label={subcontractor.status || 'Unknown'}
        />
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
