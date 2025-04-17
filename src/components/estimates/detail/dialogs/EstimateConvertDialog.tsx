import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogHeader,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { StatusType } from '@/types/common';
import { AlertCircle, Database, ArrowRightLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { convertEstimateToProject, setupDatabaseValidations } from '@/services/estimateService';

interface EstimateConvertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimate: {
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
    status: StatusType;
  };
  onStatusChange?: (id: string, status: string) => void;
  onRefresh?: () => void;
}

const EstimateConvertDialog: React.FC<EstimateConvertDialogProps> = ({
  open,
  onOpenChange,
  estimate,
  onStatusChange,
  onRefresh,
}) => {
  const { toast } = useToast();
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [conversionComplete, setConversionComplete] = useState(false);

  // Direct method to test database connection
  const testDatabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from('projects').select('projectid').limit(1);

      if (error) {
        setDebugInfo(`Database connection error: ${error.message}`);
        return false;
      }

      setDebugInfo(`Database connection successful. Found ${data?.length || 0} projects.`);
      return true;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      setDebugInfo(`Exception testing database: ${errMsg}`);
      return false;
    }
  };

  // Direct method to check estimate status and prevent duplicate conversions
  const checkEstimateStatus = async () => {
    try {
      setDebugInfo('Checking estimate status...');

      const { data, error } = await supabase
        .from('estimates')
        .select('projectid, status')
        .eq('estimateid', estimate.id)
        .single();

      if (error) {
        setDebugInfo(`Error checking estimate: ${error.message}`);
        return false;
      }

      if (data.projectid) {
        setDebugInfo(`⚠️ This estimate is already linked to project: ${data.projectid}`);
        return false;
      }

      setDebugInfo(`✅ Estimate status: ${data.status}. Not yet converted to a project.`);
      return true;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      setDebugInfo(`Exception checking estimate: ${errMsg}`);
      return false;
    }
  };

  // Direct method to create a project without all the complexity
  const createSimpleProject = async () => {
    try {
      setError(null);
      setDebugInfo('Attempting to create a simple project...');

      // Check estimate first
      const canProceed = await checkEstimateStatus();
      if (!canProceed) {
        setError('Cannot proceed - estimate already converted or has issues');
        return;
      }

      // Get the project table structure first to understand required fields
      const { data: tableInfo, error: tableError } = await supabase
        .from('projects')
        .select('*')
        .limit(1);

      if (tableError) {
        setDebugInfo(`Error getting table structure: ${tableError.message}`);
        return;
      }

      // Log the structure we found
      setDebugInfo(`Table structure: ${Object.keys(tableInfo?.[0] || {}).join(', ')}`);

      // Create a project with minimal fields
      const projectData = {
        projectid: undefined, // Will be auto-generated
        customerid: null,
        customername: estimate.client,
        projectname: `Simple Project from ${estimate.id}`,
        jobdescription: estimate.description || 'Test project created directly',
        status: 'active',
        createdon: new Date().toISOString(),
        total_budget: estimate.amount || 0,
        // Add other required fields with default values
        budget_status: 'pending',
        sitelocationaddress: estimate.location?.address || '',
        sitelocationcity: estimate.location?.city || '',
        sitelocationstate: estimate.location?.state || '',
        sitelocationzip: estimate.location?.zip || '',
      };

      setDebugInfo(`Attempting to create project with data: ${JSON.stringify(projectData)}`);

      // Insert the project
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert([projectData]) // Wrap in array for TypeScript
        .select();

      if (projectError) {
        setDebugInfo(`Failed to create project: ${projectError.message}`);
        return;
      }

      setDebugInfo(`Simple project created: ${JSON.stringify(newProject)}`);

      // Update estimate to link it - directly to converted status
      const { error: updateError } = await supabase
        .from('estimates')
        .update({
          projectid: newProject[0].projectid,
          status: 'converted', // Use converted instead of approved
        })
        .eq('estimateid', estimate.id);

      if (updateError) {
        setDebugInfo(`${debugInfo}\nFailed to update estimate: ${updateError.message}`);

        // Try to clean up the project if we failed to link it
        await supabase.from('projects').delete().eq('projectid', newProject[0].projectid);

        return;
      }

      setDebugInfo(`${debugInfo}\nEstimate updated successfully.`);

      toast({
        title: 'Project created successfully',
        description: `Project "${projectData.projectname}" has been created from this estimate.`,
        variant: 'default',
      });

      if (onStatusChange) {
        onStatusChange(estimate.id, 'converted');
      }

      if (onRefresh) {
        onRefresh();
      }

      onOpenChange(false);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      setDebugInfo(`Exception creating simple project: ${errMsg}`);
    }
  };

  const handleConvertToProject = async () => {
    setIsConverting(true);
    setShowDebugInfo(false);
    setDebugInfo('');

    try {
      // Call the enhanced service function that includes fallback approach
      const result = await convertEstimateToProject(estimate.id);

      if (result.success) {
        toast({
          title: 'Success!',
          description: `Estimate successfully converted to project ${result.projectId}`,
          variant: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Update UI state
        setIsConverting(false);
        setConversionComplete(true);

        // Update parent components
        if (onStatusChange) onStatusChange(estimate.id, 'converted');
        if (onRefresh) onRefresh();
        onOpenChange(false);
      } else {
        setIsConverting(false);
        setError(result.message || 'Unknown error during conversion');
        setShowDebugInfo(true);
        setDebugInfo(`Conversion failed: ${result.message}`);
      }
    } catch (error: any) {
      console.error('Error converting estimate to project:', error);
      setIsConverting(false);
      setError(error.message || 'Unknown error during conversion');
      setShowDebugInfo(true);
      setDebugInfo(`Exception: ${error.message}`);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Convert to Project</AlertDialogTitle>
          <AlertDialogDescription>
            This will create a new project based on this estimate. The estimate will be marked as
            converted and linked to the new project.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md flex items-start mb-4">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {showDebugInfo && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-md mb-4 text-xs">
            <pre className="whitespace-pre-wrap">{debugInfo}</pre>
          </div>
        )}

        <AlertDialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={checkEstimateStatus}
              disabled={isConverting}
            >
              Check Status
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={createSimpleProject}
              disabled={isConverting}
            >
              Simple Convert
            </Button>
          </div>

          <div className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              className="bg-[#0485ea] hover:bg-[#0375d1]"
              onClick={handleConvertToProject}
              disabled={isConverting}
            >
              {isConverting ? 'Converting...' : 'Convert to Project'}
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EstimateConvertDialog;
