
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PageTransition from '@/components/layout/PageTransition';
import SubcontractorsTable from '@/components/subcontractors/SubcontractorsTable';
import { Subcontractor } from '@/components/subcontractors/utils/subcontractorUtils';
import { Button } from '@/components/ui/button';
import { Plus, Tag } from 'lucide-react';
import SubcontractorDialog from '@/components/subcontractors/SubcontractorDialog';
import SpecialtyDialog from '@/components/subcontractors/SpecialtyDialog';

const Subcontractors = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [specialtiesUpdated, setSpecialtiesUpdated] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSpecialtyDialog, setShowSpecialtyDialog] = useState(false);
  
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
      <div className="flex justify-between items-center mb-6 md:items-center gap-4">
        <div className="relative w-full md:w-auto flex-1 max-w-sm">
          <input
            type="search"
            placeholder="Search subcontractors..."
            className="w-full px-4 py-2 border rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowSpecialtyDialog(true)}
            className="border-[#0485ea] text-[#0485ea]"
          >
            <Tag className="mr-1 h-4 w-4" />
            Specialties
          </Button>
          
          <Button
            className="bg-[#0485ea] hover:bg-[#0375d1]"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Subcontractor
          </Button>
        </div>
      </div>
      
      <SubcontractorsTable 
        subcontractors={subcontractors}
        loading={loading}
        error={error}
        searchQuery={searchQuery}
      />
      
      <SubcontractorDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubcontractorAdded={handleSubcontractorAdded}
      />

      <SpecialtyDialog
        open={showSpecialtyDialog}
        onOpenChange={setShowSpecialtyDialog}
        onSpecialtyAdded={handleSpecialtyAdded}
      />
    </PageTransition>
  );
};

export default Subcontractors;
