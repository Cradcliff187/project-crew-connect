
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Subcontractor } from '../utils/subcontractorUtils';
import { toast } from '@/hooks/use-toast';
import useSubcontractorPerformance from '../hooks/useSubcontractorPerformance';
import useSubcontractorCompliance from '../hooks/useSubcontractorCompliance';
import useSubcontractorSpecialties from '../hooks/useSubcontractorSpecialties';

export const useSubcontractorData = (subcontractorId: string | undefined) => {
  const [subcontractor, setSubcontractor] = useState<Subcontractor | null>(null);
  const [loading, setLoading] = useState(true);
  const [specialties, setSpecialties] = useState<Record<string, any>>({});
  const [projects, setProjects] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loadingAssociations, setLoadingAssociations] = useState(false);

  // Use our custom hooks to get specialized data
  const { performance, loading: loadingPerformance } = useSubcontractorPerformance(subcontractorId);
  const { compliance, loading: loadingCompliance } = useSubcontractorCompliance(subcontractorId);
  const { specialtyIds, loading: loadingSpecialtyIds } = useSubcontractorSpecialties(subcontractorId);

  const fetchSubcontractor = async () => {
    if (!subcontractorId) return;
    
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
        return;
      }
      
      console.log('Subcontractor data received:', data);
      
      // Merge data from normalized tables into a single object for backwards compatibility
      const mergedData = {
        ...data,
        // Add performance data if available
        ...(performance && {
          rating: performance.rating,
          on_time_percentage: performance.on_time_percentage,
          quality_score: performance.quality_score,
          safety_incidents: performance.safety_incidents,
          response_time_hours: performance.response_time_hours
        }),
        // Add compliance data if available
        ...(compliance && {
          insurance_expiration: compliance.insurance_expiration,
          insurance_provider: compliance.insurance_provider,
          insurance_policy_number: compliance.insurance_policy_number,
          contract_on_file: compliance.contract_on_file,
          contract_expiration: compliance.contract_expiration,
          tax_id: compliance.tax_id,
          last_performance_review: compliance.last_performance_review
        }),
        // Use specialtyIds from the hook if available
        specialty_ids: specialtyIds.length > 0 ? specialtyIds : (data.specialty_ids || [])
      };
      
      setSubcontractor(mergedData as Subcontractor);
      
      // Fetch specialties if the subcontractor has any
      if (mergedData.specialty_ids && mergedData.specialty_ids.length > 0) {
        const { data: specialtiesData, error: specialtiesError } = await supabase
          .from('subcontractor_specialties')
          .select('*')
          .in('id', mergedData.specialty_ids);
        
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
      // First try the new invoices table
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('subcontractor_invoices_new')
        .select('project_id')
        .eq('subcontractor_id', subId)
        .order('created_at', { ascending: false });
        
      if (invoicesError) {
        console.error('Error fetching invoice data from new table:', invoicesError);
        
        // Fall back to the old tables
        const { data: legacyInvoicesData, error: legacyInvoicesError } = await supabase
          .from('subinvoices')
          .select('projectid, projectname')
          .eq('subid', subId)
          .order('created_at', { ascending: false });
          
        if (legacyInvoicesError) {
          console.error('Error fetching legacy invoice data:', legacyInvoicesError);
        } else {
          // Get unique projects by projectid
          const uniqueProjects = legacyInvoicesData?.reduce((acc: any[], current) => {
            const x = acc.find(item => item.projectid === current.projectid);
            if (!x) {
              return acc.concat([current]);
            } else {
              return acc;
            }
          }, []);
          
          setProjects(uniqueProjects || []);
        }
      } else if (invoicesData && invoicesData.length > 0) {
        // Get project details for each unique project_id
        const uniqueProjectIds = [...new Set(invoicesData.map(item => item.project_id))].filter(Boolean);
        
        if (uniqueProjectIds.length > 0) {
          const { data: projectsData, error: projectsError } = await supabase
            .from('projects')
            .select('projectid, projectname')
            .in('projectid', uniqueProjectIds);
            
          if (!projectsError) {
            setProjects(projectsData || []);
          }
        }
      }

      // Safely try to fetch associated work orders
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

  // Main effect to fetch data when subcontractor ID changes
  useEffect(() => {
    if (!loadingPerformance && !loadingCompliance && !loadingSpecialtyIds) {
      fetchSubcontractor();
    }
  }, [subcontractorId, loadingPerformance, loadingCompliance, loadingSpecialtyIds]);

  // Initial data fetch
  useEffect(() => {
    fetchSubcontractor();
  }, [subcontractorId]);

  return {
    subcontractor,
    loading: loading || loadingPerformance || loadingCompliance || loadingSpecialtyIds,
    specialties,
    projects,
    workOrders,
    loadingAssociations,
    fetchSubcontractor,
  };
};

export default useSubcontractorData;
