
import { Loader2 } from 'lucide-react';

const WorkOrderLoadingState = () => {
  return (
    <div className="flex items-center justify-center h-40">
      <Loader2 className="h-8 w-8 animate-spin text-[#0485ea]" />
      <span className="ml-2 text-gray-600">Loading...</span>
    </div>
  );
};

export default WorkOrderLoadingState;
