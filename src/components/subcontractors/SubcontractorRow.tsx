import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Eye, Phone, History, Calendar } from 'lucide-react';
import { Subcontractor } from './utils/types';
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
  onView,
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
            onClick: handleViewClick,
          },
          {
            label: 'Edit subcontractor',
            icon: <Edit className="h-4 w-4" />,
            onClick: handleEditClick,
          },
        ],
      },
      {
        // Subcontractor specific actions
        items: [
          {
            label: 'Assign to project',
            icon: <Calendar className="h-4 w-4" />,
            onClick: e => {
              e.stopPropagation();
              console.log('Assign to project');
            },
          },
          {
            label: 'Call subcontractor',
            icon: <Phone className="h-4 w-4" />,
            onClick: e => {
              e.stopPropagation();
              console.log('Call subcontractor');
            },
          },
          {
            label: 'Payment history',
            icon: <History className="h-4 w-4" />,
            onClick: e => {
              e.stopPropagation();
              console.log('Payment history');
            },
          },
        ],
      },
      {
        // Destructive actions
        items: [
          {
            label: 'Delete subcontractor',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: handleDeleteClick,
            className: 'text-red-600',
          },
        ],
      },
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
      <TableCell onClick={e => e.stopPropagation()}>
        <div className="flex justify-end">
          <ActionMenu groups={getSubcontractorActions()} />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default SubcontractorRow;
