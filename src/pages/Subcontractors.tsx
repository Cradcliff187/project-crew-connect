
import { useState } from 'react';
import PageTransition from '@/components/layout/PageTransition';
import SubcontractorsHeader from '@/components/subcontractors/SubcontractorsHeader';
import SubcontractorsTable from '@/components/subcontractors/SubcontractorsTable';
import useSubcontractors from '@/components/subcontractors/hooks/useSubcontractors';
import SubcontractorSheet from '@/components/subcontractors/SubcontractorSheet';

const Subcontractors = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtiesUpdated, setSpecialtiesUpdated] = useState(0);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [selectedSubcontractor, setSelectedSubcontractor] = useState<any | null>(null);
  
  // Use our custom hook with real Supabase data
  const { subcontractors, loading, error, refetch } = useSubcontractors();
  
  const handleSubcontractorAdded = () => {
    refetch();
  };

  const handleSpecialtyAdded = () => {
    // Increment the specialties update counter to trigger a refresh in components that use specialties
    setSpecialtiesUpdated(prev => prev + 1);
  };

  const handleEditSubcontractor = (subcontractor: any) => {
    setSelectedSubcontractor(subcontractor);
    setEditSheetOpen(true);
  };

  const handleEditSheetClose = () => {
    setEditSheetOpen(false);
    setSelectedSubcontractor(null);
  };

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <SubcontractorsHeader 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          onSubcontractorAdded={handleSubcontractorAdded}
          onSpecialtyAdded={handleSpecialtyAdded}
        />
        
        <div className="mt-6">
          <SubcontractorsTable 
            subcontractors={subcontractors}
            loading={loading}
            error={error}
            searchQuery={searchQuery}
            onEditSubcontractor={handleEditSubcontractor}
          />
        </div>

        {/* Edit Subcontractor Sheet */}
        {editSheetOpen && selectedSubcontractor && (
          <SubcontractorSheet
            open={editSheetOpen}
            onOpenChange={handleEditSheetClose}
            onSubcontractorAdded={handleSubcontractorAdded}
            initialData={selectedSubcontractor}
            isEditing={true}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default Subcontractors;
