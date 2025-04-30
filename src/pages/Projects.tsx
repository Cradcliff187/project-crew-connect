import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PageTransition from '@/components/layout/PageTransition';
import ProjectsHeader from '@/components/projects/ProjectsHeader';
import ProjectsTable from '@/components/projects/ProjectsTable';
import { useQuery } from '@tanstack/react-query';

const fetchProjects = async () => {
  // 1. Fetch projects and related customer data
  const { data: projectsData, error: projectsError } = await supabase
    .from('projects')
    .select(
      // Select necessary project fields including cost basis
      'projectid, projectname, status, created_at, customerid, total_budget, current_expenses, original_base_cost, customers(customerid, customername)'
    )
    .order('created_at', { ascending: false });

  if (projectsError) {
    throw projectsError;
  }

  if (!projectsData || projectsData.length === 0) {
    return []; // Return empty if no projects found
  }

  const projectIds = projectsData.map(p => p.projectid);

  // 2. Fetch progress data (existing logic)
  const { data: progressData, error: progressError } = await supabase
    .from('project_progress')
    .select('projectid, progress_percentage')
    .in('projectid', projectIds); // Filter by fetched project IDs

  if (progressError) {
    console.warn('Error fetching progress data:', progressError);
  }
  const progressMap = new Map();
  if (progressData) {
    progressData.forEach(item => {
      progressMap.set(item.projectid, item.progress_percentage);
    });
  }

  // 3. Fetch Change Order Cost Impact Sums
  const { data: coCostData, error: coCostError } = await supabase
    .from('project_change_orders') // Assuming this is the correct table name
    .select('project_id, cost_impact')
    .in('project_id', projectIds)
    .eq('status', 'Approved'); // Only include Approved COs in cost budget

  if (coCostError) {
    console.warn('Error fetching change order cost impacts:', coCostError);
  }
  const coCostMap = new Map<string, number>();
  if (coCostData) {
    coCostData.forEach(item => {
      const currentSum = coCostMap.get(item.project_id) || 0;
      coCostMap.set(item.project_id, currentSum + (item.cost_impact || 0));
    });
  }

  // 4. Transform data
  return projectsData.map(project => {
    const originalBaseCost = project.original_base_cost || 0;
    const changeOrderCostSum = coCostMap.get(project.projectid) || 0;
    const totalEstimatedCostBudget = originalBaseCost + changeOrderCostSum;
    const currentExpenses = project.current_expenses || 0;

    return {
      ...project,
      createdon: project.created_at, // Keep existing alias if needed elsewhere
      customername:
        project.customers?.customername || (project.customerid ? 'Unknown Customer' : 'No Client'),
      budget: project.total_budget || 0, // Keep original 'budget' field mapped to total_budget (revenue)
      spent: currentExpenses, // Keep original 'spent' field mapped to current_expenses
      progress: progressMap.has(project.projectid) ? progressMap.get(project.projectid) : 0,
      original_base_cost: originalBaseCost, // Pass original base cost
      total_estimated_cost_budget: totalEstimatedCostBudget, // Pass calculated total cost budget
      // Ensure total_budget is still passed for Est. Revenue column
      total_budget: project.total_budget || 0,
    };
  });
};

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const {
    data: projects = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    meta: {
      onError: (error: any) => {
        console.error('Error fetching projects:', error);
        toast({
          title: 'Error fetching projects',
          description: error.message,
          variant: 'destructive',
        });
      },
    },
  });

  const error = queryError ? (queryError as Error).message : null;

  // Function to trigger refresh of projects
  const handleProjectAdded = () => {
    refetch();
  };

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <ProjectsHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onProjectAdded={handleProjectAdded}
          showAddDialog={showAddDialog}
          setShowAddDialog={setShowAddDialog}
        />

        <div className="mt-6">
          <ProjectsTable
            projects={projects}
            loading={loading}
            error={error}
            searchQuery={searchQuery}
          />
        </div>
      </div>
    </PageTransition>
  );
};

export default Projects;
