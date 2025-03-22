
import { ClipboardList, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const WorkOrderEmptyState = () => {
  const navigate = useNavigate();
  
  const handleCreateWorkOrder = () => {
    // Navigate to work orders page and trigger the work order dialog
    // We'll add a query parameter that can be detected by the WorkOrders page
    navigate('/work-orders?openNewWorkOrder=true');
  };

  return (
    <div className="mt-6 flex justify-center p-8 text-center">
      <div className="flex flex-col items-center max-w-md">
        <div className="rounded-full bg-muted p-3">
          <ClipboardList className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No work orders yet</h3>
        <p className="mt-2 text-muted-foreground">
          Create your first maintenance work order to start tracking service requests and maintenance tasks.
        </p>
        <Button 
          className="mt-4 bg-[#0485ea] hover:bg-[#0375d1]"
          onClick={handleCreateWorkOrder}
        >
          <Plus className="h-4 w-4 mr-1" /> Create Work Order
        </Button>
      </div>
    </div>
  );
};

export default WorkOrderEmptyState;
