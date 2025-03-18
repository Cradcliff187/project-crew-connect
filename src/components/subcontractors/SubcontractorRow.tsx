
import React from 'react';
import { format } from 'date-fns';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/ui/StatusBadge';
import { Subcontractor, Specialty } from './utils/subcontractorUtils';
import { StatusType } from '@/types/common';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';
import { Edit, Eye, Trash, ClipboardList } from 'lucide-react';

interface SubcontractorRowProps {
  subcontractor: Subcontractor;
  specialties: Record<string, Specialty>;
  onEdit?: (subcontractor: Subcontractor) => void;
  onDelete?: (subcontractor: Subcontractor) => void;
  onView?: (subcontractor: Subcontractor) => void;
}

export const mapStatusToStatusBadge = (status: string | null): StatusType => {
  const statusMap: Record<string, StatusType> = {
    "ACTIVE": "active",
    "INACTIVE": "inactive",
    "QUALIFIED": "qualified",
    "VERIFIED": "verified",
    "PENDING": "pending",
    "REJECTED": "rejected"
  };
  
  if (!status) return "not_set";
  
  return statusMap[status] || "not_set";
};

const SubcontractorRow: React.FC<SubcontractorRowProps> = ({
  subcontractor,
  specialties,
  onEdit = () => {},
  onDelete = () => {},
  onView = () => {}
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  const getSpecialtyLabels = () => {
    if (!subcontractor.specialty_ids || subcontractor.specialty_ids.length === 0) {
      return <span className="text-muted-foreground italic">None specified</span>;
    }
    
    return (
      <div className="flex flex-wrap gap-1">
        {subcontractor.specialty_ids.slice(0, 2).map(id => (
          <Badge key={id} variant="outline" className="text-xs">
            {specialties[id]?.specialty || 'Unknown'}
          </Badge>
        ))}
        {subcontractor.specialty_ids.length > 2 && (
          <Badge variant="outline" className="text-xs">
            +{subcontractor.specialty_ids.length - 2} more
          </Badge>
        )}
      </div>
    );
  };
  
  const getPaymentTermsLabel = (terms: string | null) => {
    const termsMap: Record<string, string> = {
      "NET15": "Net 15",
      "NET30": "Net 30",
      "NET45": "Net 45",
      "NET60": "Net 60",
      "DUE_ON_RECEIPT": "Due on Receipt"
    };
    
    return termsMap[terms || "NET30"] || "Net 30";
  };
  
  const subcontractorActions: ActionGroup[] = [
    {
      items: [
        {
          label: 'View Details',
          icon: <Eye className="h-4 w-4" />,
          onClick: () => onView(subcontractor)
        },
        {
          label: 'Edit Subcontractor',
          icon: <Edit className="h-4 w-4" />,
          onClick: () => onEdit(subcontractor)
        }
      ]
    },
    {
      items: [
        {
          label: 'View Assignments',
          icon: <ClipboardList className="h-4 w-4" />,
          onClick: () => console.log('View assignments', subcontractor.subid)
        }
      ]
    },
    {
      items: [
        {
          label: 'Delete Subcontractor',
          icon: <Trash className="h-4 w-4" />,
          onClick: () => onDelete(subcontractor),
          className: 'text-red-600'
        }
      ]
    }
  ];

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{subcontractor.subname}</div>
        <div className="text-xs text-muted-foreground">{subcontractor.subid}</div>
      </TableCell>
      <TableCell>
        {getSpecialtyLabels()}
      </TableCell>
      <TableCell>
        <div>{subcontractor.contactemail || 'No Email'}</div>
        <div className="text-xs text-muted-foreground">{subcontractor.phone || 'No Phone'}</div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          {subcontractor.city && subcontractor.state ? (
            `${subcontractor.city}, ${subcontractor.state}`
          ) : (
            <span className="text-muted-foreground">No Location</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        {formatDate(subcontractor.created_at)}
      </TableCell>
      <TableCell>
        <StatusBadge status={mapStatusToStatusBadge(subcontractor.status)} />
      </TableCell>
      <TableCell className="text-right">
        <ActionMenu groups={subcontractorActions} />
      </TableCell>
    </TableRow>
  );
};

export default SubcontractorRow;
