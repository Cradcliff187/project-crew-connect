
import { Button } from '@/components/ui/button';

interface WorkOrderErrorProps {
  error: string | null;
}

const WorkOrderError = ({ error }: WorkOrderErrorProps) => {
  if (!error) return null;
  
  return (
    <div className="container mx-auto p-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium">Error loading work orders</h3>
        <p className="text-red-600">{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2 text-red-600 border-red-200 hover:bg-red-50"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    </div>
  );
};

export default WorkOrderError;
