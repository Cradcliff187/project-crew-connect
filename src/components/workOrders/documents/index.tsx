import WorkOrderDocumentsSection from '@/components/work-orders/documents/WorkOrderDocumentsSection';

interface WorkOrderDocumentsProps {
  workOrderId: string;
  entityType: string;
}

const WorkOrderDocuments = ({ workOrderId }: WorkOrderDocumentsProps) => {
  return <WorkOrderDocumentsSection workOrderId={workOrderId} />;
};

export default WorkOrderDocuments;
