
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
        
        // Try the new table first
        const { data: complianceData, error: complianceError } = await supabase
          .from('subcontractor_compliance')
          .select('*')
          .eq('subcontractor_id', subcontractorId)
          .maybeSingle();
        
        if (complianceError) {
          throw complianceError;
        }
        
        if (complianceData) {
          setCompliance(complianceData);
        } else {
          // Fall back to the old table structure for backward compatibility
          const { data: subcontractorData, error: subcontractorError } = await supabase
            .from('subcontractors')
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
          
          if (subcontractorError) {
            throw subcontractorError;
          }
          
          setCompliance(subcontractorData);
        }
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
