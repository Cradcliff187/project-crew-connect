
import { Clock } from 'lucide-react';

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
        <Clock className="h-6 w-6 text-[#0485ea]" />
      </div>
      <h3 className="text-lg font-medium mb-1">No Time Logged</h3>
      <p className="text-muted-foreground max-w-sm">
        No time has been logged for this work order yet. Click the "Log Time" button to add time entries.
      </p>
    </div>
  );
};

export default EmptyState;
