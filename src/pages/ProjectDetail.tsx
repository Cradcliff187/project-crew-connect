
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTransition from '@/components/layout/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProjectProgressCard } from '@/components/projects/detail';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchProjectData(projectId);
    }
  }, [projectId]);

  const fetchProjectData = async (id: string) => {
    try {
      setLoading(true);
      
      // Fetch the project data
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('projectid', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      setProject(data);
    } catch (error: any) {
      console.error('Error fetching project data:', error);
      setError(error.message || 'Error fetching project data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#0485ea]" />
        </div>
      </PageTransition>
    );
  }

  if (error || !project) {
    return (
      <PageTransition>
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Error Loading Project</h1>
          <p className="text-red-500">{error || 'Project not found'}</p>
          <button 
            onClick={() => navigate('/projects')} 
            className="px-4 py-2 bg-[#0485ea] text-white rounded-md hover:bg-[#0373ce]"
          >
            Back to Projects
          </button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{project.projectname || 'Project Details'}</h1>
          <Badge variant={project.status === 'ACTIVE' ? 'default' : 'outline'} className="capitalize">
            {project.status || 'No Status'}
          </Badge>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Project ID</h3>
                <p>{project.projectid}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Customer</h3>
                <p>{project.customername || 'Not specified'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p>{project.jobdescription || 'No description'}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Budget Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Total Budget</h3>
                <p>${project.total_budget?.toLocaleString() || '0'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Current Expenses</h3>
                <p>${project.current_expenses?.toLocaleString() || '0'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Budget Status</h3>
                <p className="capitalize">{project.budget_status || 'Not set'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Project progress card */}
          {projectId && <ProjectProgressCard projectId={projectId} />}
        </div>
      </div>
    </PageTransition>
  );
};

export default ProjectDetail;
