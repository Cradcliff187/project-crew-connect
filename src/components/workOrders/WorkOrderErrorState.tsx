
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkOrderErrorStateProps {
  error: string;
}

const WorkOrderErrorState = ({ error }: WorkOrderErrorStateProps) => {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-6 text-center mt-6">
      <div className="flex flex-col items-center">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <h3 className="mt-2 text-lg font-medium text-red-800">Error Loading Work Orders</h3>
        <p className="mt-1 text-sm text-red-700">{error}</p>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
};

export default WorkOrderErrorState;
