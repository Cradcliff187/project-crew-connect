
import { Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ProjectForm from './ProjectForm';
import { useProjectSubmit } from './hooks/useProjectSubmit';

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectAdded: () => void;
  estimateData?: {
    id: string;
    name: string;
    customerName?: string;
    customerId?: string;
    description?: string;
    location?: {
      address?: string;
      city?: string;
      state?: string;
      zip?: string;
    };
  };
}

const ProjectDialog = ({
  open,
  onOpenChange,
  onProjectAdded,
  estimateData
}: ProjectDialogProps) => {
  const handleSuccess = () => {
    onOpenChange(false); // Close dialog
    onProjectAdded(); // Refresh projects list
  };
  
  const { isSubmitting, handleSubmit } = useProjectSubmit(handleSuccess);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {estimateData ? 'Convert Estimate to Project' : 'Add New Project'}
          </DialogTitle>
          <DialogDescription>
            {estimateData 
              ? 'Create a project based on this estimate.'
              : 'Enter the project details to add it to your system.'}
          </DialogDescription>
        </DialogHeader>
        
        <ProjectForm 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting} 
          estimateData={estimateData}
        />
        
        <DialogFooter className="pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="project-form"
            className="bg-[#0485ea] hover:bg-[#0375d1]"
            disabled={isSubmitting}
          >
            <Check className="h-4 w-4 mr-1" />
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDialog;
