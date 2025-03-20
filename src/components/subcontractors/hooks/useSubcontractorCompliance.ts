
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useSubcontractorCompliance = (subcontractorId: string | undefined) => {
  const [compliance, setCompliance] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCompliance = async () => {
      if (!subcontractorId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Updated to use the new consolidated table
        const { data, error } = await supabase
          .from('subcontractors_new')
          .select(`
            insurance_expiration, 
            insurance_provider,
            insurance_policy_number,
            contract_on_file,
            contract_expiration,
            tax_id,
            last_performance_review
          `)
          .eq('subid', subcontractorId)
          .maybeSingle();
        
        if (error) {
          throw error;
        }
        
        setCompliance(data);
      } catch (error: any) {
        console.error('Error fetching subcontractor compliance:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompliance();
  }, [subcontractorId]);
  
  return { compliance, loading, error };
};

export default useSubcontractorCompliance;
