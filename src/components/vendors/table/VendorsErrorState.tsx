
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface VendorsErrorStateProps {
  error: string;
}

const VendorsErrorState = ({ error }: VendorsErrorStateProps) => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-100 rounded-md animate-in fade-in-50">
      <div className="rounded-full bg-red-100 p-3 mb-3">
        <AlertCircle className="h-10 w-10 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold mb-1 text-red-700">Error Loading Vendors</h3>
      <p className="text-red-600 text-center mb-4 max-w-md">
        {error || "There was an issue loading the vendors. Please try again."}
      </p>
      <Button variant="outline" onClick={handleRefresh}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Refresh
      </Button>
    </div>
  );
};

export default VendorsErrorState;
