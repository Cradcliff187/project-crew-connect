import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import PageTransition from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ProjectDetails, { ProjectDetails as ProjectDetailsType } from './ProjectDetails';

const ProjectDetailRefactored = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetailsType | null>(null);
  const [customerDetails, setCustomerDetails] = useState<{
    customerid: string;
    customername: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch project details that can be reused
  const fetchProjectDetails = async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      // Fetch the project data
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('projectid', projectId)
        .single();

      if (error) throw error;

      const projectData = data as ProjectDetailsType;
      setProject(projectData);

      // If there's a customerid but no customername (or customername is empty),
      // fetch the customer details directly
      if (
        projectData.customerid &&
        (!projectData.customername || projectData.customername.trim() === '')
      ) {
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('customerid, customername')
          .eq('customerid', projectData.customerid)
          .single();

        if (customerError) {
          console.warn('Error fetching customer details:', customerError);
        } else if (customerData) {
          setCustomerDetails(customerData as { customerid: string; customername: string });
        }
      }
    } catch (error: any) {
      console.error('Error fetching project details:', error);
      setError(error.message);
      toast({
        title: 'Error loading project',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  const handleBackClick = () => {
    navigate('/projects');
  };

  const handleRefresh = () => {
    // Use the fetchProjectDetails function to refresh data
    fetchProjectDetails();
  };

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <Button variant="outline" onClick={handleBackClick} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-14 w-full" />
            <div className="grid gap-6 md:grid-cols-3">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-48 w-full" />
          </div>
        ) : error ? (
          <Card className="py-8">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The project you're looking for doesn't exist or you don't have permission to view
                it.
              </p>
              <Button onClick={handleBackClick}>Return to Projects</Button>
            </div>
          </Card>
        ) : project ? (
          <ProjectDetails
            project={project}
            customerDetails={customerDetails}
            onStatusChange={handleRefresh}
          />
        ) : null}
      </div>
    </PageTransition>
  );
};

export default ProjectDetailRefactored;
