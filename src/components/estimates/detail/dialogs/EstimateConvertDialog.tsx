import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { convertEstimateToProject, updateEstimateStatus } from '@/services/estimateService';
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
  const [projectName, setProjectName] = useState(estimate.project);
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = useCallback(async () => {
    setIsConverting(true);
    try {
      const result = await convertEstimateToProject(estimate.id);

      if (result.success && result.projectId) {
        toast({
          title: 'Estimate Converted',
          description: `Estimate has been converted to project ${result.projectId}`,
        });

        // Optimistically update the status
        if (onStatusChange) {
          onStatusChange(estimate.id, 'converted');
        }

        // Refresh the data
        if (onRefresh) {
          onRefresh();
        }

        onOpenChange(false);
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to convert estimate',
          variant: 'destructive', // Changed from isClosable: true
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to convert estimate',
        variant: 'destructive', // Changed from isClosable: true
      });
    } finally {
      setIsConverting(false);
    }
  }, [estimate.id, onOpenChange, onRefresh, onStatusChange, toast]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Convert Estimate to Project</DialogTitle>
          <DialogDescription>
            Are you sure you want to convert this estimate to a project? This action is irreversible.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Project Name
            </Label>
            <Input
              id="name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleConvert} disabled={isConverting}>
            {isConverting ? 'Converting...' : 'Convert to Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EstimateConvertDialog;
