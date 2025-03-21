
import { Info } from 'lucide-react';

const NoStatusOptions = () => {
  return (
    <div className="flex items-center ml-2 text-sm text-muted-foreground">
      <Info className="h-4 w-4 mr-1" />
      No status changes available
    </div>
  );
};

export default NoStatusOptions;
