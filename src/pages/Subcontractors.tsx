
import { useState } from 'react';
import PageTransition from '@/components/layout/PageTransition';
import SubcontractorsHeader from '@/components/subcontractors/SubcontractorsHeader';
import SubcontractorsTable from '@/components/subcontractors/SubcontractorsTable';
import useSubcontractors from '@/components/subcontractors/hooks/useSubcontractors';

const Subcontractors = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtiesUpdated, setSpecialtiesUpdated] = useState(0);
  
  // Use our custom hook with real Supabase data
  const { subcontractors, loading, error, refetch } = useSubcontractors();
  
  const handleSubcontractorAdded = () => {
    refetch();
  };

  const handleSpecialtyAdded = () => {
    // Increment the specialties update counter to trigger a refresh in components that use specialties
    setSpecialtiesUpdated(prev => prev + 1);
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
          />
        </div>
      </div>
    </PageTransition>
  );
};

export default Subcontractors;
