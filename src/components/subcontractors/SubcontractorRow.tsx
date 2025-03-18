
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, History, FileText, Archive, Tool } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { TableCell, TableRow } from '@/components/ui/table';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';
import { Subcontractor, Specialty, mapStatusToStatusBadge, formatDate } from './utils/subcontractorUtils';

interface SubcontractorRowProps {
  subcontractor: Subcontractor;
  specialties: Record<string, Specialty>;
  onView?: (subcontractor: Subcontractor) => void;
  onEdit?: (subcontractor: Subcontractor) => void;
}

const SubcontractorRow = ({ 
  subcontractor: sub, 
  specialties, 
  onView = () => {}, 
  onEdit = () => {} 
}: SubcontractorRowProps) => {
  // Get specialty name by ID
  const getSpecialtyName = (id: string) => {
    return specialties[id]?.specialty || 'Unknown Specialty';
  };
  
  const getSubcontractorActions = (): ActionGroup[] => {
    return [
      {
        items: [
          {
            label: 'View details',
            icon: <Eye className="w-4 h-4" />,
            onClick: () => onView(sub)
          },
          {
            label: 'Edit subcontractor',
            icon: <Edit className="w-4 h-4" />,
            onClick: () => onEdit(sub)
          },
          {
            label: 'Work history',
            icon: <History className="w-4 h-4" />,
            onClick: () => console.log('View work history', sub.subid)
          }
        ]
      },
      {
        items: [
          {
            label: 'Specialties',
            icon: <Tool className="w-4 h-4" />,
            onClick: () => console.log('Manage specialties', sub.subid)
          },
          {
            label: 'Insurance info',
            icon: <FileText className="w-4 h-4" />,
            onClick: () => console.log('View insurance info', sub.subid)
          }
        ]
      },
      {
        items: [
          {
            label: 'Deactivate',
            icon: <Archive className="w-4 h-4" />,
            onClick: () => console.log('Deactivate subcontractor', sub.subid),
            className: 'text-red-600'
          }
        ]
      }
    ];
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
        <ActionMenu groups={getSubcontractorActions()} size="sm" />
      </TableCell>
    </TableRow>
  );
};

export default SubcontractorRow;
