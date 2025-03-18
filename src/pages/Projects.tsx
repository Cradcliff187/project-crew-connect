
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PageTransition from '@/components/layout/PageTransition';
import Header from '@/components/layout/Header';
import ProjectsHeader from '@/components/projects/ProjectsHeader';
import ProjectsTable, { Project } from '@/components/projects/ProjectsTable';

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Function to trigger refresh of projects
  const handleProjectAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  // Fetch projects from Supabase
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('projectid, projectname, customername, customerid, status, createdon')
          .order('createdon', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // Transform data to match our UI requirements
        const projectsWithDefaults = data.map(project => ({
          ...project,
          // Default values for fields not yet in database
          budget: Math.floor(Math.random() * 200000) + 50000, // Temporary random budget
          spent: Math.floor(Math.random() * 150000), // Temporary random spent amount
          progress: Math.floor(Math.random() * 100), // Temporary random progress
        }));
        
        setProjects(projectsWithDefaults);
      } catch (error: any) {
        console.error('Error fetching projects:', error);
        setError(error.message);
        toast({
          title: 'Error fetching projects',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, [refreshTrigger]);

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
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
        </main>
      </div>
    </PageTransition>
  );
};

export default Projects;
