
import { useState } from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { filterSubcontractors } from '../utils/filterUtils';
import SubcontractorsTableHeader from './SubcontractorsTableHeader';
import SubcontractorsTableBody from './SubcontractorsTableBody';
import SubcontractorsEmptyState from './SubcontractorsEmptyState';
import SubcontractorsLoadingState from './SubcontractorsLoadingState';
import SubcontractorsErrorState from './SubcontractorsErrorState';

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
  onEditSubcontractor
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <SubcontractorsTableHeader />
          </TableRow>
        </TableHeader>
        <TableBody>
          <SubcontractorsTableBody 
            subcontractors={filteredSubcontractors} 
            onEditSubcontractor={onEditSubcontractor} 
          />
        </TableBody>
      </Table>
    </div>
  );
};

export default SubcontractorsTable;
