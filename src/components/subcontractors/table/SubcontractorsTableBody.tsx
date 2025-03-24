
import { useNavigate } from 'react-router-dom';
import { TableRow } from '@/components/ui/table';
import SubcontractorTableRow from './SubcontractorTableRow';

interface Subcontractor {
  subid: string;
  subname: string;
  contactemail?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  status?: string;
  specialty_ids?: string[];
  createdon?: string;
}

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
