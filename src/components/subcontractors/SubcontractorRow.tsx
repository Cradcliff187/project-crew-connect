
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Subcontractor } from './utils/subcontractorUtils';
import { useNavigate } from 'react-router-dom';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';
import SubcontractorInfo from './row/SubcontractorInfo';
import SubcontractorSpecialties from './row/SubcontractorSpecialties';
import SubcontractorContactInfo from './row/SubcontractorContactInfo';
import SubcontractorLocation from './row/SubcontractorLocation';
import SubcontractorDetails from './row/SubcontractorDetails';
import SubcontractorStatusBadge from './row/SubcontractorStatusBadge';

interface SubcontractorRowProps {
  subcontractor: Subcontractor;
  specialties: Record<string, any>;
  onEdit: (subcontractor: Subcontractor) => void;
  onDelete: (subcontractor: Subcontractor) => void;
  onView: (subcontractor: Subcontractor) => void;
}

const SubcontractorRow: React.FC<SubcontractorRowProps> = ({
  subcontractor,
  specialties,
  onEdit,
  onDelete,
  onView
}) => {
  const navigate = useNavigate();
  
  // Handle view click - Navigate to detail page
  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Call the provided onView prop (for backward compatibility)
    onView(subcontractor);
    // Navigate to the detail page
    navigate(`/subcontractors/${subcontractor.subid}`);
  };

  // Handle edit click
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(subcontractor);
  };

  // Handle delete click
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(subcontractor);
  };

  // Handle row click
  const handleRowClick = () => {
    navigate(`/subcontractors/${subcontractor.subid}`);
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
            icon: <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>,
            onClick: (e) => console.log('Assign to project')
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
    <TableRow onClick={handleRowClick} className="cursor-pointer hover:bg-muted/50">
      <TableCell>
        <SubcontractorInfo subcontractor={subcontractor} />
      </TableCell>
      <TableCell>
        <SubcontractorSpecialties 
          specialtyIds={subcontractor.specialty_ids} 
          specialties={specialties} 
        />
      </TableCell>
      <TableCell>
        <SubcontractorContactInfo subcontractor={subcontractor} />
      </TableCell>
      <TableCell>
        <SubcontractorLocation subcontractor={subcontractor} />
      </TableCell>
      <TableCell>
        <SubcontractorDetails subcontractor={subcontractor} />
      </TableCell>
      <TableCell>
        <SubcontractorStatusBadge status={subcontractor.status} />
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end">
          <ActionMenu groups={getSubcontractorActions()} />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default SubcontractorRow;
