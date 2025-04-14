import { Loader2 } from 'lucide-react';

const WorkOrderLoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-60">
      <Loader2 className="h-10 w-10 animate-spin text-[#0485ea]" />
      <span className="mt-4 text-gray-600 font-medium">Loading work order data...</span>
    </div>
  );
};

export default WorkOrderLoadingState;
