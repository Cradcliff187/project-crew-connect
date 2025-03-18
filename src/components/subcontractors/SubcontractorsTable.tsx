
import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody } from '@/components/ui/table';
import SubcontractorRow from './SubcontractorRow';
import SubcontractorEmptyState from './SubcontractorEmptyState';
import SubcontractorLoadingState from './SubcontractorLoadingState';
import SubcontractorErrorState from './SubcontractorErrorState';
import { useSpecialties } from './hooks/useSpecialties';
import { Subcontractor, filterSubcontractors } from './utils/subcontractorUtils';
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
    
    // Make sure we have a complete subcontractor object with all properties
    if (!subcontractor.subid) {
      console.error('Subcontractor is missing subid:', subcontractor);
      toast({
        title: "Error",
        description: "Cannot edit subcontractor: Missing ID",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedSubcontractor(subcontractor);
    setEditDialogOpen(true);
  };
  
  const handleDeleteClick = (subcontractor: Subcontractor) => {
    console.log('Delete subcontractor', subcontractor.subid);
    // Would implement delete functionality here
    toast({
      title: "Not implemented",
      description: "Delete functionality is not implemented yet",
      variant: "destructive"
    });
  };
  
  const handleViewClick = (subcontractor: Subcontractor) => {
    console.log('View subcontractor', subcontractor.subid);
    navigate(`/subcontractors/${subcontractor.subid}`);
  };
  
  const handleSubcontractorUpdated = () => {
    // This would be used to refresh the subcontractors list
    toast({
      title: "Subcontractor updated",
      description: "The subcontractor has been updated successfully"
    });
    window.location.reload(); // Simple reload to refresh data
  };
  
  // Show loading state if any data is still loading
  if (loading || loadingSpecialties) {
    return <SubcontractorLoadingState />;
  }
  
  // Show error state if there's an error
  if (error || specialtiesError) {
    return <SubcontractorErrorState error={error || specialtiesError || 'An error occurred'} />;
  }
  
  // Show empty state if no subcontractors
  if (!filteredSubcontractors || filteredSubcontractors.length === 0) {
    return <SubcontractorEmptyState />;
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
        </Table>
      </div>
      
      {/* Edit Subcontractor Dialog - ALWAYS render the dialog but control visibility with open prop */}
      <SubcontractorDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubcontractorAdded={handleSubcontractorUpdated}
        initialData={selectedSubcontractor}
        isEditing={true}
      />
    </div>
  );
};

export default SubcontractorsTable;
