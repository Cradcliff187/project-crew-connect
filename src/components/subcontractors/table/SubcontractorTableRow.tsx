
import { TableRow, TableCell } from '@/components/ui/table';
import { Subcontractor } from '../utils/types';
import StatusBadge from '@/components/ui/StatusBadge';
import useSpecialties from '../hooks/useSpecialties';
import SubcontractorInfo from './components/SubcontractorInfo';
import SubcontractorContact from './components/SubcontractorContact';
import SubcontractorLocation from './components/SubcontractorLocation';
import SpecialtiesBadges from './components/SpecialtiesBadges';
import SubcontractorActionsMenu from './components/SubcontractorActionsMenu';
import { useStatusMapping } from './hooks/useStatusMapping';

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
  const { getStatusType } = useStatusMapping();
  
  const handleRowClick = () => {
    onViewDetails(subcontractor);
  };
  
  return (
    <TableRow onClick={handleRowClick} className="cursor-pointer hover:bg-[#0485ea]/5 transition-colors">
      <TableCell>
        <SubcontractorInfo 
          name={subcontractor.subname}
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
          phone={subcontractor.phone}
        />
      </TableCell>
      <TableCell>
        <SubcontractorLocation
          city={subcontractor.city}
          state={subcontractor.state}
        />
      </TableCell>
      <TableCell>
        <StatusBadge 
          status={getStatusType(subcontractor.status)}
          label={subcontractor.status || 'Unknown'}
        />
      </TableCell>
      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
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
