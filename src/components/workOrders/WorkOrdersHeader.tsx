import { Search, Filter, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/layout/PageHeader';
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
      <PageHeader
        title="Work Orders"
        description="Manage maintenance work orders and service requests"
      >
        <div className="relative w-full md:w-auto flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search work orders..."
            className="pl-9 subtle-input rounded-md"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Filter className="h-4 w-4 mr-1" />
            Filter
            <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
          </Button>
          <Button
            size="sm"
            className="bg-[#0485ea] hover:bg-[#0375d1]"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Work Order
          </Button>
        </div>
      </PageHeader>

      <WorkOrderDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onWorkOrderSaved={onWorkOrderAdded}
      />
    </>
  );
};

export default WorkOrdersHeader;
