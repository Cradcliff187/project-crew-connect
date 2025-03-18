
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Edit, MoreHorizontal, Trash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import PageTransition from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/ui/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mapStatusToStatusBadge, formatDate } from './ProjectsTable';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ProjectMilestones from './milestones/ProjectMilestones';
import ProjectProgress from './progress/ProjectProgress';
import { Skeleton } from '@/components/ui/skeleton';

interface ProjectDetails {
  projectid: string;
  projectname: string;
  customername: string;
  customerid: string;
  jobdescription: string;
  status: string;
  createdon: string;
  sitelocationaddress: string | null;
  sitelocationcity: string | null;
  sitelocationstate: string | null;
  sitelocationzip: string | null;
}

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProjectDetails = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('projectid', projectId)
          .single();
        
        if (error) throw error;
        setProject(data as ProjectDetails);
      } catch (error: any) {
        console.error('Error fetching project details:', error);
        setError(error.message);
        toast({
          title: 'Error loading project',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);
  
  const handleBackClick = () => {
    navigate('/projects');
  };
  
  const handleDeleteProject = async () => {
    if (!project) return;
    
    if (window.confirm(`Are you sure you want to delete project "${project.projectname}"?`)) {
      try {
        const { error } = await supabase
          .from('projects')
          .update({ status: 'cancelled' })
          .eq('projectid', project.projectid);
        
        if (error) throw error;
        
        toast({
          title: 'Project cancelled',
          description: `Project "${project.projectname}" has been cancelled.`,
        });
        
        navigate('/projects');
      } catch (error: any) {
        toast({
          title: 'Error cancelling project',
          description: error.message,
          variant: 'destructive'
        });
      }
    }
  };
  
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <div className="mb-6">
            <Button variant="outline" onClick={handleBackClick} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
            
            {loading ? (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-10 w-24" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                </div>
              </>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={handleBackClick}>Return to Projects</Button>
              </div>
            ) : project ? (
              <>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                  <div>
                    <h1 className="text-2xl font-bold">{project.projectname}</h1>
                    <div className="flex items-center mt-2 text-muted-foreground">
                      <span className="mr-2">{project.projectid}</span>
                      <span className="mx-2">•</span>
                      <span>Created on {formatDate(project.createdon)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex items-center">
                    <StatusBadge status={mapStatusToStatusBadge(project.status)} className="mr-4" />
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/projects/${project.projectid}/edit`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Project
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDeleteProject} className="text-red-600">
                          <Trash className="h-4 w-4 mr-2" />
                          Cancel Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Customer</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-semibold">{project.customername || 'No Customer'}</div>
                      <div className="text-sm text-muted-foreground">{project.customerid}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Site Location</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {project.sitelocationaddress ? (
                        <div>
                          <div>{project.sitelocationaddress}</div>
                          <div>{project.sitelocationcity}, {project.sitelocationstate} {project.sitelocationzip}</div>
                        </div>
                      ) : (
                        <div className="text-muted-foreground">Same as customer address</div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Schedule</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">No schedule set</span>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Job Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {project.jobdescription ? (
                      <p>{project.jobdescription}</p>
                    ) : (
                      <p className="text-muted-foreground">No job description provided.</p>
                    )}
                  </CardContent>
                </Card>
                
                <Tabs defaultValue="progress">
                  <TabsList className="mb-4">
                    <TabsTrigger value="progress">Progress</TabsTrigger>
                    <TabsTrigger value="milestones">Tasks & Milestones</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="progress">
                    <ProjectProgress projectId={project.projectid} />
                  </TabsContent>
                  
                  <TabsContent value="milestones">
                    <ProjectMilestones projectId={project.projectid} />
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <div className="text-center py-12">
                <p>Project not found.</p>
                <Button onClick={handleBackClick} className="mt-4">Return to Projects</Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default ProjectDetail;
