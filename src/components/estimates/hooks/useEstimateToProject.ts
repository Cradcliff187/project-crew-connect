
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useBudgetIntegration } from '@/hooks/useBudgetIntegration';

export const useEstimateToProject = () => {
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();
  const { createBudgetFromEstimate } = useBudgetIntegration();

  const convertEstimateToProject = async (estimate: {
    id: string;
    client: string;
    project: string;
    description?: string;
    location?: {
      address?: string;
      city?: string;
      state?: string;
      zip?: string;
    };
    amount: number;
  }) => {
    try {
      setIsConverting(true);
      console.log("Converting estimate to project:", estimate);

      // Check if project already exists for this estimate
      const { data: existingProject, error: checkError } = await supabase
        .from('projects')
        .select('projectid')
        .eq('projectname', estimate.project)
        .eq('customerid', estimate.client.startsWith('CUS-') ? estimate.client : null);

      if (checkError) {
        throw checkError;
      }

      if (existingProject && existingProject.length > 0) {
        toast({
          title: "Project Exists",
          description: `A project with the name "${estimate.project}" already exists.`,
          variant: "destructive"
        });
        return null;
      }

      // The projectid field is auto-generated by a database trigger,
      // but we need to include it in the TypeScript interface to satisfy the type check.
      // We'll use null for now, and the database will generate the actual ID.
      const projectData = {
        projectid: undefined, // This will be set by the database trigger
        customerid: estimate.client.startsWith('CUS-') ? estimate.client : null,
        customername: !estimate.client.startsWith('CUS-') ? estimate.client : null,
        projectname: estimate.project,
        jobdescription: estimate.description || '',
        status: 'active',
        sitelocationaddress: estimate.location?.address || '',
        sitelocationcity: estimate.location?.city || '',
        sitelocationstate: estimate.location?.state || '',
        sitelocationzip: estimate.location?.zip || '',
        createdon: new Date().toISOString(),
        total_budget: estimate.amount // Set initial budget from estimate amount
      };

      console.log("Creating new project with data:", projectData);

      // Insert the project data
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert(projectData)
        .select();

      if (projectError) {
        console.error("Error creating project:", projectError);
        throw projectError;
      }

      if (!newProject || newProject.length === 0) {
        throw new Error('Failed to create project - no data returned');
      }

      console.log("Project created successfully:", newProject[0]);

      // Update the estimate to link it to the project
      const { error: updateError } = await supabase
        .from('estimates')
        .update({ projectid: newProject[0].projectid, status: 'approved' })
        .eq('estimateid', estimate.id);

      if (updateError) {
        console.error("Error updating estimate with project ID:", updateError);
        throw updateError;
      }

      // Create initial budget items from the estimate
      await createBudgetFromEstimate(newProject[0].projectid, estimate.id);

      // Return the newly created project
      return newProject[0];
    } catch (error) {
      console.error('Error converting estimate to project:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to convert estimate to project. Please try again.";
        
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsConverting(false);
    }
  };

  return {
    isConverting,
    convertEstimateToProject
  };
};
