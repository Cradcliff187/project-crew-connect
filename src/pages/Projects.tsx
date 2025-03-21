import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PageTransition from '@/components/layout/PageTransition';
import ProjectsHeader from '@/components/projects/ProjectsHeader';
import ProjectsTable, { Project } from '@/components/projects/ProjectsTable';
import { useQuery } from '@tanstack/react-query';

const fetchProjects = async () => {
  // First, fetch all projects
  const { data: projectsData, error: projectsError } = await supabase
    .from('projects')
    .select('projectid, projectname, customername, customerid, status, createdon, total_budget, current_expenses, budget_status')
    .order('createdon', { ascending: false });
  
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
  
  // Transform data to match our UI requirements
  return projectsData.map(project => ({
    ...project,
    // Default values for budget fields
    budget: project.total_budget || 0,
    spent: project.current_expenses || 0,
    // Use actual progress from database if available, otherwise default to 0
    progress: progressMap.has(project.projectid) 
      ? progressMap.get(project.projectid) 
      : 0
  }));
};

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    data: projects = [], 
    isLoading: loading, 
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    meta: {
      onError: (error: any) => {
        console.error('Error fetching projects:', error);
      }
    }
  });

  // Handle errors outside the query to show toast
  useEffect(() => {
    if (queryError) {
      toast({
        title: 'Error fetching projects',
        description: (queryError as Error).message,
        variant: 'destructive'
      });
    }
  }, [queryError]);

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
        />
        
        <ProjectsTable 
          projects={projects}
          loading={loading}
          error={error}
          searchQuery={searchQuery}
        />
      </div>
    </PageTransition>
  );
};

export default Projects;
