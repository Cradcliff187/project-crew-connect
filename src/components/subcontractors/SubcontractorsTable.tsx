
import { useEffect } from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSpecialties } from './hooks/useSpecialties';
import { Subcontractor, filterSubcontractors } from './utils/subcontractorUtils';
import SubcontractorRow from './SubcontractorRow';
import SubcontractorLoadingState from './SubcontractorLoadingState';
import SubcontractorEmptyState from './SubcontractorEmptyState';
import SubcontractorErrorState from './SubcontractorErrorState';

interface SubcontractorsTableProps {
  subcontractors: Subcontractor[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
}

const SubcontractorsTable = ({ 
  subcontractors, 
  loading, 
  error, 
  searchQuery 
}: SubcontractorsTableProps) => {
  const { specialties, loading: specialtiesLoading } = useSpecialties();
  
  // Filter subcontractors based on search query
  const filteredSubcontractors = filterSubcontractors(subcontractors, searchQuery);

  return (
    <div className="premium-card animate-in" style={{ animationDelay: '0.2s' }}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subcontractor</TableHead>
            <TableHead>Specialties</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Added</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading || specialtiesLoading ? (
            <SubcontractorLoadingState />
          ) : error ? (
            <SubcontractorErrorState error={error} />
          ) : filteredSubcontractors.length === 0 ? (
            <SubcontractorEmptyState />
          ) : (
            filteredSubcontractors.map((sub) => (
              <SubcontractorRow 
                key={sub.subid} 
                subcontractor={sub} 
                specialties={specialties} 
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SubcontractorsTable;
