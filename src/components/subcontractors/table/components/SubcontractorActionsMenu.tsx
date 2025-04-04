
import React from 'react';
import { Mail, MapPin, Phone, Edit, Trash2, Eye } from 'lucide-react';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';
import { Subcontractor } from '../../utils/types';

interface SubcontractorActionsMenuProps {
  subcontractor: Subcontractor;
  onViewDetails: (subcontractor: Subcontractor) => void;
  onEditSubcontractor?: (subcontractor: Subcontractor) => void;
}

const SubcontractorActionsMenu = ({
  subcontractor,
  onViewDetails,
  onEditSubcontractor
}: SubcontractorActionsMenuProps) => {
  
  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails(subcontractor);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditSubcontractor) {
      onEditSubcontractor(subcontractor);
    }
  };

  const handleCallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (subcontractor.phone) {
      window.location.href = `tel:${subcontractor.phone}`;
    }
  };

  const handleEmailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (subcontractor.contactemail) {
      window.location.href = `mailto:${subcontractor.contactemail}`;
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Delete subcontractor', subcontractor.subid);
  };

  const getSubcontractorActions = (): ActionGroup[] => {
    return [
      {
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
    <div className="flex justify-end">
      <ActionMenu groups={getSubcontractorActions()} />
    </div>
  );
};

export default SubcontractorActionsMenu;
