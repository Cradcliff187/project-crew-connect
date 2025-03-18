
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PageTransition from '@/components/layout/PageTransition';
import SubcontractorsHeader from '@/components/subcontractors/SubcontractorsHeader';
import SubcontractorsTable, { Subcontractor } from '@/components/subcontractors/SubcontractorsTable';

const Subcontractors = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch subcontractors from Supabase
  const fetchSubcontractors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subcontractors')
        .select('subid, subname, contactemail, phone, address, city, state, zip, status, created_at')
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

  return (
    <PageTransition>
      <div className="space-y-6">
        <SubcontractorsHeader 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          onSubcontractorAdded={handleSubcontractorAdded}
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
