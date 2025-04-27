import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PageTransition from '@/components/layout/PageTransition';
import ProjectsHeader from '@/components/projects/ProjectsHeader';
import ProjectsTable from '@/components/projects/ProjectsTable';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/layout/PageHeader';

const fetchProjects = async () => {
  // First, fetch all projects
  const { data: projectsData, error: projectsError } = await supabase
    .from('projects')
    .select(
      'projectid, projectname, customerid, status, created_at, total_budget, current_expenses, budget_status'
    )
    .order('created_at', { ascending: false });

  if (projectsError) {
    throw projectsError;
  }

  // Then, fetch all progress data in a single query
  const { data: progressData, error: progressError } = await supabase
    .from('project_progress')
    .select('projectid, progress_percentage');

  if (progressError) {
    console.warn('Error fetching progress data:', progressError);
    // Continue without progress data rather than failing completely
  }

  // Create a map of project ID to progress percentage for quick lookup
  const progressMap = new Map();
  if (progressData) {
    progressData.forEach(item => {
      progressMap.set(item.projectid, item.progress_percentage);
    });
  }

  // Collect all customerIds from projects
  const customerIds = projectsData.map(project => project.customerid).filter(id => id !== null);

  // If there are any customerIds, fetch customer data
  let customerMap = new Map();
  if (customerIds.length > 0) {
    const { data: customersData, error: customersError } = await supabase
      .from('customers')
      .select('customerid, customername')
      .in('customerid', customerIds);

    if (customersError) {
      console.warn('Error fetching customer data:', customersError);
    } else if (customersData) {
      // Create a map of customer ID to customer name
      customerMap = new Map(
        customersData.map(customer => [customer.customerid, customer.customername])
      );
    }
  }

  // Transform data to match our UI requirements
  return projectsData.map(project => ({
    ...project,
    createdon: project.created_at,
    customername: project.customerid
      ? customerMap.get(project.customerid) || 'Unknown Customer'
      : 'No Customer',
    budget: project.total_budget || 0,
    spent: project.current_expenses || 0,
    progress: progressMap.has(project.projectid) ? progressMap.get(project.projectid) : 0,
  }));
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
        <PageHeader title="Projects" description="Manage construction and maintenance projects">
          <ProjectsHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onProjectAdded={handleProjectAdded}
            showAddDialog={showAddDialog}
            setShowAddDialog={setShowAddDialog}
          />
        </PageHeader>

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
