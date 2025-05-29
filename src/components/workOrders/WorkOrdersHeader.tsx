import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { FilterButton } from '@/components/ui/filter-button';
import WorkOrderDialog from './dialog/WorkOrderDialog';

interface WorkOrdersHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onWorkOrderAdded: () => void;
  showAddDialog: boolean;
  setShowAddDialog: (show: boolean) => void;
}

const WorkOrdersHeader = ({
  searchQuery,
  setSearchQuery,
  onWorkOrderAdded,
  showAddDialog,
  setShowAddDialog,
}: WorkOrdersHeaderProps) => {
  return (
    <>
      {/* Clean Search and Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <SearchInput
          placeholder="Search work orders..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          containerClassName="w-full sm:w-auto flex-1 max-w-md"
        />

        <div className="flex items-center gap-2">
          <FilterButton />
          <Button
            size="sm"
            variant="default"
            onClick={() => setShowAddDialog(true)}
            className="bg-[#0485ea] hover:bg-[#0375d1] font-opensans"
          >
            <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
            New Work Order
          </Button>
        </div>
      </div>

      <WorkOrderDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onWorkOrderSaved={onWorkOrderAdded}
      />
    </>
  );
};

export default WorkOrdersHeader;
