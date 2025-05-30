import { Table, TableBody } from '@/components/ui/table';
import { filterSubcontractors } from '../utils/filterUtils';
import { Subcontractor } from '../utils/types';
import SubcontractorsTableHeader from './SubcontractorsTableHeader';
import SubcontractorsTableBody from './SubcontractorsTableBody';
import SubcontractorsEmptyState from './SubcontractorsEmptyState';
import SubcontractorsLoadingState from './SubcontractorsLoadingState';
import SubcontractorsErrorState from './SubcontractorsErrorState';

interface SubcontractorsTableProps {
  subcontractors: Subcontractor[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  onEditSubcontractor?: (subcontractor: Subcontractor) => void;
}

const SubcontractorsTable = ({
  subcontractors,
  loading,
  error,
  searchQuery,
  onEditSubcontractor,
}: SubcontractorsTableProps) => {
  const filteredSubcontractors = filterSubcontractors(subcontractors, searchQuery);

  if (loading) {
    return <SubcontractorsLoadingState />;
  }

  if (error) {
    return <SubcontractorsErrorState error={error} />;
  }

  if (filteredSubcontractors.length === 0) {
    return <SubcontractorsEmptyState searchQuery={searchQuery} />;
  }

  return (
    <Table className="border rounded-md">
      <SubcontractorsTableHeader />
      <TableBody>
        <SubcontractorsTableBody
          subcontractors={filteredSubcontractors}
          onEditSubcontractor={onEditSubcontractor}
        />
      </TableBody>
    </Table>
  );
};

export default SubcontractorsTable;
