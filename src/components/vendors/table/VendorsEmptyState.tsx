
import { Button } from "@/components/ui/button";
import { FileX2, Plus } from "lucide-react";

interface VendorsEmptyStateProps {
  searchQuery: string;
}

const VendorsEmptyState = ({ searchQuery }: VendorsEmptyStateProps) => {
  const isFiltered = searchQuery.length > 0;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-muted/10 border rounded-md animate-in fade-in-50">
      <div className="rounded-full bg-muted/50 p-3 mb-3">
        <FileX2 className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">
        {isFiltered ? 'No vendors match your search' : 'No vendors yet'}
      </h3>
      <p className="text-muted-foreground text-center mb-4 max-w-md">
        {isFiltered
          ? `There are no vendors matching "${searchQuery}". Try another search term.`
          : 'Start by adding your first vendor.'}
      </p>
      {!isFiltered && (
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Your First Vendor
        </Button>
      )}
    </div>
  );
};

export default VendorsEmptyState;
