
import { useNavigate } from 'react-router-dom';
import { TableRow } from '@/components/ui/table';
import { Subcontractor } from '../utils/types';
import SubcontractorTableRow from './SubcontractorTableRow';

interface SubcontractorsTableBodyProps {
  subcontractors: Subcontractor[];
  onEditSubcontractor?: (subcontractor: Subcontractor) => void;
}

const SubcontractorsTableBody = ({ 
  subcontractors, 
  onEditSubcontractor 
}: SubcontractorsTableBodyProps) => {
  const navigate = useNavigate();
  
  const handleViewDetails = (subcontractor: Subcontractor) => {
    navigate(`/subcontractors/${subcontractor.subid}`);
  };
  
  return (
    <>
      {subcontractors.map((subcontractor) => (
        <SubcontractorTableRow 
          key={subcontractor.subid} 
          subcontractor={subcontractor} 
          onViewDetails={handleViewDetails}
          onEditSubcontractor={onEditSubcontractor}
        />
      ))}
    </>
  );
};

export default SubcontractorsTableBody;
