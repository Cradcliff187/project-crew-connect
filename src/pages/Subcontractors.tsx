
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PageTransition from '@/components/layout/PageTransition';
import SubcontractorsHeader from '@/components/subcontractors/SubcontractorsHeader';
import SubcontractorsTable from '@/components/subcontractors/SubcontractorsTable';
import { Subcontractor } from '@/components/subcontractors/utils/subcontractorUtils';

const Subcontractors = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [specialtiesUpdated, setSpecialtiesUpdated] = useState(0);
  
  // Fetch subcontractors from Supabase
  const fetchSubcontractors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subcontractors')
        .select('subid, subname, contactemail, phone, address, city, state, zip, status, created_at, specialty_ids')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setSubcontractors(data || []);
    } catch (error: any) {
      console.error('Error fetching subcontractors:', error);
      setError(error.message);
      toast({
        title: 'Error fetching subcontractors',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSubcontractors();
  }, []);

  const handleSubcontractorAdded = () => {
    fetchSubcontractors();
  };

  const handleSpecialtyAdded = () => {
    // Increment the specialties update counter to trigger a refresh in components that use specialties
    setSpecialtiesUpdated(prev => prev + 1);
    // We don't need to refetch subcontractors here as the specialties are separate
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <SubcontractorsHeader 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          onSubcontractorAdded={handleSubcontractorAdded}
          onSpecialtyAdded={handleSpecialtyAdded}
        />
        
        <SubcontractorsTable 
          subcontractors={subcontractors}
          loading={loading}
          error={error}
          searchQuery={searchQuery}
        />
      </div>
    </PageTransition>
  );
};

export default Subcontractors;
