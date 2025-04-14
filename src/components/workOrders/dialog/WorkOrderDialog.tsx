import WorkOrderMultiStepDialog from './WorkOrderMultiStepDialog';

interface WorkOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkOrderSaved: () => void;
}

const WorkOrderDialog = ({ isOpen, onClose, onWorkOrderSaved }: WorkOrderDialogProps) => {
  return (
    <WorkOrderMultiStepDialog
      open={isOpen}
      onOpenChange={onClose}
      onWorkOrderAdded={onWorkOrderSaved}
    />
  );
};

export default WorkOrderDialog;
