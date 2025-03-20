
import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody } from '@/components/ui/table';
import SubcontractorRow from './SubcontractorRow';
import SubcontractorEmptyState from './SubcontractorEmptyState';
import SubcontractorLoadingState from './SubcontractorLoadingState';
import SubcontractorErrorState from './SubcontractorErrorState';
import { useSpecialties } from './hooks/useSpecialties';
import { Subcontractor } from './utils/types';
import { filterSubcontractors } from './utils/filterUtils';
import SubcontractorDialog from './SubcontractorDialog';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface SubcontractorsTableProps {
  subcontractors: Subcontractor[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
}

const SubcontractorsTable: React.FC<SubcontractorsTableProps> = ({
  subcontractors,
  loading,
  error,
  searchQuery
}) => {
  const navigate = useNavigate();
  
  // Get specialties
  const { specialties, loading: loadingSpecialties, error: specialtiesError } = useSpecialties();
  
  // State for specialty map (id -> Specialty)
  const [specialtyMap, setSpecialtyMap] = useState<Record<string, any>>({});
  
  // State for edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSubcontractor, setSelectedSubcontractor] = useState<Subcontractor | null>(null);
  
  // Process specialties into a map for easy lookup
  useEffect(() => {
    if (specialties && Object.keys(specialties).length > 0) {
      setSpecialtyMap(specialties);
    }
  }, [specialties]);
  
  // Filter subcontractors based on search query
  const filteredSubcontractors = filterSubcontractors(subcontractors, searchQuery);
  
  const handleEditClick = (subcontractor: Subcontractor) => {
    console.log('Edit subcontractor clicked:', subcontractor);
    setSelectedSubcontractor(subcontractor);
    setEditDialogOpen(true);
  };
  
  const handleDeleteClick = (subcontractor: Subcontractor) => {
    toast({
      title: "Not implemented",
      description: "Delete functionality is not implemented yet",
      variant: "destructive"
    });
  };
  
  const handleViewClick = (subcontractor: Subcontractor) => {
    navigate(`/subcontractors/${subcontractor.subid}`);
  };
  
  const handleSubcontractorUpdated = () => {
    toast({
      title: "Subcontractor updated",
      description: "The subcontractor has been updated successfully"
    });
    window.location.reload(); // Simple reload to refresh data
  };
  
  // Show error state if there's an error
  if (error || specialtiesError) {
    return (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Specialties</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Added</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <SubcontractorErrorState error={error || specialtiesError || 'An error occurred'} />
          </TableBody>
        </Table>
      </div>
    );
  }
  
  return (
    <div>
      <div className="border rounded-md mb-6">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Specialties</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Added</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          
          {/* Loading state */}
          {(loading || loadingSpecialties) && <SubcontractorLoadingState />}
          
          {/* Data loaded but empty */}
          {!loading && !loadingSpecialties && (!filteredSubcontractors || filteredSubcontractors.length === 0) && (
            <TableBody>
              <SubcontractorEmptyState />
            </TableBody>
          )}
          
          {/* Data loaded with results */}
          {!loading && !loadingSpecialties && filteredSubcontractors && filteredSubcontractors.length > 0 && (
            <TableBody>
              {filteredSubcontractors.map((subcontractor) => (
                <SubcontractorRow
                  key={subcontractor.subid}
                  subcontractor={subcontractor}
                  specialties={specialtyMap}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onView={handleViewClick}
                />
              ))}
            </TableBody>
          )}
        </Table>
      </div>
      
      {/* Edit Subcontractor Dialog */}
      {selectedSubcontractor && (
        <SubcontractorDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSubcontractorAdded={handleSubcontractorUpdated}
          initialData={selectedSubcontractor}
          isEditing={true}
        />
      )}
    </div>
  );
};

export default SubcontractorsTable;
