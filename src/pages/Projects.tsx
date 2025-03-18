
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PageTransition from '@/components/layout/PageTransition';
import ProjectsTable, { Project } from '@/components/projects/ProjectsTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ProjectDialog from '@/components/projects/ProjectDialog';

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  
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
      <div className="flex justify-between items-center mb-6 md:items-center gap-4">
        <div className="relative w-full md:w-auto flex-1 max-w-sm">
          <input
            type="search"
            placeholder="Search projects..."
            className="w-full px-4 py-2 border rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button 
          size="sm" 
          className="bg-[#0485ea] hover:bg-[#0375d1]"
          onClick={() => setShowProjectDialog(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          New Project
        </Button>
      </div>
      
      <ProjectsTable 
        projects={projects}
        loading={loading}
        error={error}
        searchQuery={searchQuery}
      />
      
      <ProjectDialog 
        open={showProjectDialog} 
        onOpenChange={setShowProjectDialog}
        onProjectAdded={handleProjectAdded}
      />
    </PageTransition>
  );
};

export default Projects;
