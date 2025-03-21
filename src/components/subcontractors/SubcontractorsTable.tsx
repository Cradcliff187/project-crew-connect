
import React, { useState, useEffect } from 'react';
import { Package, Hammer } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
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
import { Button } from '@/components/ui/button';

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
      <div className="premium-card animate-in" style={{ animationDelay: '0.2s' }}>
        <Table>
          <TableHeader className="bg-gray-50">
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
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-red-500">
                <p>Error loading subcontractors: {error || specialtiesError}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }
  
  // Table loading skeleton
  if (loading || loadingSpecialties) {
    return (
      <div className="premium-card animate-in" style={{ animationDelay: '0.2s' }}>
        <Table>
          <TableHeader className="bg-gray-50">
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
          <SubcontractorLoadingState />
        </Table>
      </div>
    );
  }
  
  // Empty state
  if (!filteredSubcontractors || filteredSubcontractors.length === 0) {
    return (
      <div className="premium-card animate-in" style={{ animationDelay: '0.2s' }}>
        <Table>
          <TableHeader className="bg-gray-50">
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
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                <Hammer className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                <p>No subcontractors found. Add your first subcontractor!</p>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }
  
  // Data loaded with results
  return (
    <div className="premium-card animate-in" style={{ animationDelay: '0.2s' }}>
      <Table>
        <TableHeader className="bg-gray-50">
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
