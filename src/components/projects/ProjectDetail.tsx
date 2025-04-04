
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Edit, MoreHorizontal, Trash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import PageTransition from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/ui/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mapStatusToStatusBadge, formatDate } from './ProjectsTable';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ProjectMilestones from './milestones/ProjectMilestones';
import ProjectProgress from './progress/ProjectProgress';
import ProjectBudget from './budget/ProjectBudget';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusType } from '@/types/common';

interface ProjectDetails {
  projectid: string;
  projectname: string;
  customername: string | null;
  customerid: string | null;
  jobdescription: string;
  status: string;
  createdon: string;
  sitelocationaddress: string | null;
  sitelocationcity: string | null;
  sitelocationstate: string | null;
  sitelocationzip: string | null;
  total_budget: number | null;
  current_expenses: number | null;
  budget_status: string | null;
}

interface CustomerDetails {
  customerid: string;
  customername: string;
}

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProjectDetails = async () => {
      setLoading(true);
      try {
        // Fetch the project data
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('projectid', projectId)
          .single();
        
        if (error) throw error;
        
        const projectData = data as ProjectDetails;
        setProject(projectData);
        
        // If there's a customerid but no customername (or customername is empty),
        // fetch the customer details directly
        if (projectData.customerid && (!projectData.customername || projectData.customername.trim() === '')) {
          console.log('Fetching customer details for ID:', projectData.customerid);
          const { data: customerData, error: customerError } = await supabase
            .from('customers')
            .select('customerid, customername')
            .eq('customerid', projectData.customerid)
            .single();
          
          if (customerError) {
            console.warn('Error fetching customer details:', customerError);
          } else if (customerData) {
            console.log('Found customer details:', customerData);
            setCustomerDetails(customerData as CustomerDetails);
            
            // Update the project data with the customer name
            setProject(prev => prev ? {
              ...prev,
              customername: customerData.customername
            } : prev);
          }
        }
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
  
  // Format currency
  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get customer display name - use details if available, otherwise fallback
  const getCustomerName = () => {
    if (customerDetails?.customername) {
      return customerDetails.customername;
    }
    return project?.customername || 'No Customer';
  }
  
  // Get customer ID with proper formatting
  const getCustomerId = () => {
    return customerDetails?.customerid || project?.customerid || '';
  }
  
  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
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
                    <div className="text-lg font-semibold">{getCustomerName()}</div>
                    <div className="text-sm text-muted-foreground">{getCustomerId()}</div>
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
                    <CardTitle className="text-sm font-medium text-muted-foreground">Budget</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-lg font-semibold">{formatCurrency(project.total_budget)}</div>
                        <div className="text-sm text-muted-foreground">
                          {project.current_expenses ? formatCurrency(project.current_expenses) + ' spent' : 'No expenses'}
                        </div>
                      </div>
                      {project.budget_status && (
                        <StatusBadge 
                          status={project.budget_status as StatusType} 
                        />
                      )}
                    </div>
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
                  <TabsTrigger value="budget">Budget</TabsTrigger>
                </TabsList>
                
                <TabsContent value="progress">
                  <ProjectProgress projectId={project.projectid} />
                </TabsContent>
                
                <TabsContent value="milestones">
                  <ProjectMilestones projectId={project.projectid} />
                </TabsContent>
                
                <TabsContent value="budget">
                  <ProjectBudget projectId={project.projectid} />
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
      </div>
    </PageTransition>
  );
};

export default ProjectDetail;
