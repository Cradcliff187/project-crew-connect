
import { ClipboardList, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';

const WorkOrderEmptyState = () => {
  const navigate = useNavigate();
  
  const handleCreateWorkOrder = () => {
    // Navigate to work orders page and trigger the work order dialog
    // We'll add a query parameter that can be detected by the WorkOrders page
    navigate('/work-orders?openNewWorkOrder=true');
  };

  return (
    <Card className="mt-6 flex justify-center p-8 text-center bg-card shadow-md">
      <div className="flex flex-col items-center max-w-md">
        <div className="rounded-full bg-construction-50 p-3">
          <ClipboardList className="h-8 w-8 text-construction-600" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No work orders yet</h3>
        <p className="mt-2 text-muted-foreground">
          Create your first maintenance work order to start tracking service requests and maintenance tasks.
        </p>
        <Button 
          className="mt-4"
          onClick={handleCreateWorkOrder}
        >
          <Plus className="h-4 w-4 mr-1" /> Create Work Order
        </Button>
      </div>
    </Card>
  );
};

export default WorkOrderEmptyState;
