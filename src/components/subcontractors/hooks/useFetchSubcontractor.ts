
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Subcontractor } from '../utils/types';
import { toast } from '@/hooks/use-toast';

export const useFetchSubcontractor = () => {
  const [subcontractor, setSubcontractor] = useState<Subcontractor | null>(null);
  const [loading, setLoading] = useState(true);
  const [specialties, setSpecialties] = useState<Record<string, any>>({});

  const fetchSubcontractor = async (subcontractorId: string | undefined) => {
    if (!subcontractorId) return null;
    
    try {
      setLoading(true);
      console.log('Fetching subcontractor with ID:', subcontractorId);
      
      const { data, error } = await supabase
        .from('subcontractors')
        .select('*')
        .eq('subid', subcontractorId)
        .maybeSingle();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      if (!data) {
        console.error('No subcontractor found with ID:', subcontractorId);
        setSubcontractor(null);
        return null;
      }
      
      console.log('Subcontractor data received:', data);
      
      // Process the data and ensure numeric values are properly typed
      const processedData = {
        ...data,
        rating: typeof data.rating === 'number' ? data.rating : null,
        hourly_rate: typeof data.hourly_rate === 'number' ? data.hourly_rate : null,
        on_time_percentage: typeof data.on_time_percentage === 'number' ? data.on_time_percentage : null,
        quality_score: typeof data.quality_score === 'number' ? data.quality_score : null,
        safety_incidents: typeof data.safety_incidents === 'number' ? data.safety_incidents : null,
        response_time_hours: typeof data.response_time_hours === 'number' ? data.response_time_hours : null,
        specialty_ids: Array.isArray(data.specialty_ids) ? data.specialty_ids : []
      };
      
      setSubcontractor(processedData as Subcontractor);
      
      // Fetch specialties if the subcontractor has any
      if (processedData.specialty_ids && processedData.specialty_ids.length > 0) {
        const { data: specialtiesData, error: specialtiesError } = await supabase
          .from('subcontractor_specialties')
          .select('*')
          .in('id', processedData.specialty_ids);
        
        if (specialtiesError) throw specialtiesError;
        
        // Convert to a map for easier lookup
        const specialtiesMap = (specialtiesData || []).reduce((acc, curr) => {
          acc[curr.id] = curr;
          return acc;
        }, {} as Record<string, any>);
        
        setSpecialties(specialtiesMap);
      }

      return processedData as Subcontractor;
    } catch (error: any) {
      console.error('Error fetching subcontractor:', error);
      toast({
        title: 'Error fetching subcontractor',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    subcontractor,
    loading,
    specialties,
    fetchSubcontractor
  };
};

export default useFetchSubcontractor;
