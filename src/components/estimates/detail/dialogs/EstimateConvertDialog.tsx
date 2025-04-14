import React from 'react';
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
import { useEstimateToProject } from '../../hooks/useEstimateToProject';
import { StatusType } from '@/types/common';

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
  const { convertEstimateToProject, isConverting } = useEstimateToProject();

  const handleConvertToProject = async () => {
    try {
      const projectData = await convertEstimateToProject(estimate);

      onOpenChange(false);

      if (projectData) {
        toast({
          title: 'Success',
          description: `Estimate converted to project: ${projectData.projectname}`,
        });

        if (onStatusChange) {
          onStatusChange(estimate.id, 'converted');
        }

        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (error) {
      console.error('Error converting estimate to project:', error);
      toast({
        title: 'Error',
        description: 'Failed to convert estimate to project. Please try again.',
        variant: 'destructive',
      });
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
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            className="bg-[#0485ea] hover:bg-[#0375d1]"
            onClick={handleConvertToProject}
            disabled={isConverting}
          >
            {isConverting ? 'Converting...' : 'Convert to Project'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EstimateConvertDialog;
