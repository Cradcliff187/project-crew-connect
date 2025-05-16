import { TableRow, TableCell } from '@/components/ui/table';
import StatusBadge from '@/components/common/status/StatusBadge';
import { Subcontractor } from '../utils/types';
import useSpecialties from '../hooks/useSpecialties';
import SubcontractorInfo from './components/SubcontractorInfo';
import SubcontractorContact from './components/SubcontractorContact';
import SubcontractorLocation from './components/SubcontractorLocation';
import SpecialtiesBadges from './components/SpecialtiesBadges';
import SubcontractorActionsMenu from './components/SubcontractorActionsMenu';
import { useStatusMapping } from './hooks/useStatusMapping';
import { useNavigate } from 'react-router-dom';

interface SubcontractorTableRowProps {
  subcontractor: Subcontractor;
  onViewDetails: (subcontractor: Subcontractor) => void;
  onEditSubcontractor?: (subcontractor: Subcontractor) => void;
}

const SubcontractorTableRow = ({
  subcontractor,
  onViewDetails,
  onEditSubcontractor,
}: SubcontractorTableRowProps) => {
  const { specialties, loading } = useSpecialties();
  const { getStatusType } = useStatusMapping();
  const navigate = useNavigate();

  const handleRowClick = () => {
    // Both call the callback and navigate programmatically
    onViewDetails(subcontractor);
    navigate(`/subcontractors/${subcontractor.subid}`);
  };

  return (
    <TableRow
      onClick={handleRowClick}
      className="cursor-pointer hover:bg-primary/5 transition-colors"
    >
      <TableCell>
        <SubcontractorInfo
          name={subcontractor.company_name || subcontractor.contact_name || 'Unnamed Sub'}
          id={subcontractor.subid}
        />
      </TableCell>
      <TableCell>
        <SpecialtiesBadges
          specialtyIds={subcontractor.specialty_ids || []}
          specialties={specialties}
          loading={loading}
        />
      </TableCell>
      <TableCell>
        <SubcontractorContact
          email={subcontractor.contactemail}
          phone={subcontractor.phone_number}
        />
      </TableCell>
      <TableCell>
        <SubcontractorLocation city={subcontractor.city} state={subcontractor.state} />
      </TableCell>
      <TableCell>
        <StatusBadge
          status={getStatusType(subcontractor.status)}
          label={subcontractor.status || 'Unknown'}
        />
      </TableCell>
      <TableCell className="text-right" onClick={e => e.stopPropagation()}>
        <SubcontractorActionsMenu
          subcontractor={subcontractor}
          onViewDetails={onViewDetails}
          onEditSubcontractor={onEditSubcontractor}
        />
      </TableCell>
    </TableRow>
  );
};

export default SubcontractorTableRow;
