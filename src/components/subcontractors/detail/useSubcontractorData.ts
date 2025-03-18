
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Subcontractor } from '../utils/subcontractorUtils';
import { toast } from '@/hooks/use-toast';

export const useSubcontractorData = (subcontractorId: string | undefined) => {
  const [subcontractor, setSubcontractor] = useState<Subcontractor | null>(null);
  const [loading, setLoading] = useState(true);
  const [specialties, setSpecialties] = useState<Record<string, any>>({});
  const [projects, setProjects] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loadingAssociations, setLoadingAssociations] = useState(false);

  const fetchSubcontractor = async () => {
    if (!subcontractorId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subcontractors')
        .select('*')
        .eq('subid', subcontractorId)
        .single();
      
      if (error) throw error;
      
      setSubcontractor(data as Subcontractor);
      
      // Fetch specialties if the subcontractor has any
      if (data?.specialty_ids && data.specialty_ids.length > 0) {
        const { data: specialtiesData, error: specialtiesError } = await supabase
          .from('subcontractor_specialties')
          .select('*')
          .in('id', data.specialty_ids);
        
        if (specialtiesError) throw specialtiesError;
        
        // Convert to a map for easier lookup
        const specialtiesMap = (specialtiesData || []).reduce((acc, curr) => {
          acc[curr.id] = curr;
          return acc;
        }, {} as Record<string, any>);
        
        setSpecialties(specialtiesMap);
      }

      // Fetch associated projects and work orders
      await fetchAssociatedData(data?.subid);
    } catch (error: any) {
      console.error('Error fetching subcontractor:', error);
      toast({
        title: 'Error fetching subcontractor',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAssociatedData = async (subId: string) => {
    if (!subId) return;

    setLoadingAssociations(true);
    try {
      // Fetch associated projects - safely fetch by string ID
      const { data: projectsData, error: projectsError } = await supabase
        .from('subinvoices')
        .select('projectid, projectname')
        .eq('subid', subId)
        .order('created_at', { ascending: false });
      
      if (projectsError) {
        console.error('Error fetching project data:', projectsError);
      } else {
        // Get unique projects by projectid
        const uniqueProjects = projectsData?.reduce((acc: any[], current) => {
          const x = acc.find(item => item.projectid === current.projectid);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);
        
        setProjects(uniqueProjects || []);
      }

      // Safely try to fetch associated work orders - handle potential uuid vs string format issues
      try {
        const { data: workOrdersData, error: workOrdersError } = await supabase
          .from('maintenance_work_orders')
          .select('work_order_id, title, status')
          .eq('assigned_to', subId)
          .order('created_at', { ascending: false });
        
        if (!workOrdersError) {
          setWorkOrders(workOrdersData || []);
        }
      } catch (workOrderError) {
        console.error('Error fetching work orders:', workOrderError);
        // Don't throw error for work orders - just log it
      }
    } catch (error: any) {
      console.error('Error fetching associated data:', error);
      // We don't show a toast here to not disrupt the main flow
    } finally {
      setLoadingAssociations(false);
    }
  };

  useEffect(() => {
    fetchSubcontractor();
  }, [subcontractorId]);

  return {
    subcontractor,
    loading,
    specialties,
    projects,
    workOrders,
    loadingAssociations,
    fetchSubcontractor,
  };
};

export default useSubcontractorData;
