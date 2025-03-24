
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState({
    activeProjects: 0,
    pendingEstimates: 0,
    totalRevenue: 0,
    activeContacts: 0,
    budgetAlerts: [] as { projectId: string, projectName: string, budget: number, spent: number, status: string }[],
  });
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      setMetricsLoading(true);
      setError(null);
      
      try {
        // Fetch active projects count
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('projectid, projectname, total_budget, current_expenses, budget_status')
          .in('status', ['active', 'ACTIVE', 'in_progress', 'IN_PROGRESS']);
          
        if (projectsError) throw projectsError;
        
        // Fetch pending estimates count
        const { count: estimatesCount, error: estimatesError } = await supabase
          .from('estimates')
          .select('estimateid', { count: 'exact', head: true })
          .in('status', ['draft', 'pending', 'DRAFT', 'PENDING']);
          
        if (estimatesError) throw estimatesError;
        
        // Calculate total revenue (from projects total_budget)
        const totalBudget = projectsData?.reduce((sum, project) => sum + (project.total_budget || 0), 0) || 0;
        
        // Fetch active contacts count
        const { count: contactsCount, error: contactsError } = await supabase
          .from('contacts')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'ACTIVE');
          
        if (contactsError) throw contactsError;
        
        // Identify projects with budget alerts (over 75% spent)
        const budgetAlerts = projectsData?.filter(project => 
          project.total_budget > 0 && 
          project.current_expenses / project.total_budget > 0.75
        ).map(project => ({
          projectId: project.projectid,
          projectName: project.projectname,
          budget: project.total_budget,
          spent: project.current_expenses,
          status: project.budget_status === 'critical' ? 'critical' : 'warning'
        })) || [];
        
        setMetrics({
          activeProjects: projectsData?.length || 0,
          pendingEstimates: estimatesCount || 0,
          totalRevenue: totalBudget,
          activeContacts: contactsCount || 0,
          budgetAlerts: budgetAlerts.slice(0, 3), // Limit to 3 alerts
        });
      } catch (err: any) {
        console.error('Error fetching dashboard metrics:', err);
        setError(err.message);
      } finally {
        setMetricsLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  return { metrics, metricsLoading, error };
}
