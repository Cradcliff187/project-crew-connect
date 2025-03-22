
import WorkOrderMultiStepDialog from './WorkOrderMultiStepDialog';

interface WorkOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWorkOrderAdded: () => void;
}

const WorkOrderDialog = ({ 
  open, 
  onOpenChange, 
  onWorkOrderAdded 
}: WorkOrderDialogProps) => {
  return (
    <WorkOrderMultiStepDialog 
      open={open}
      onOpenChange={onOpenChange}
      onWorkOrderAdded={onWorkOrderAdded}
    />
  );
};

export default WorkOrderDialog;
