
import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/layout/PageHeader';
import WorkOrderDialog from './WorkOrderDialog';

interface WorkOrdersHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onWorkOrderAdded: () => void;
}

const WorkOrdersHeader = ({
  searchQuery,
  setSearchQuery,
  onWorkOrderAdded
}: WorkOrdersHeaderProps) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  
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
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button
          size="sm"
          className="flex-1 md:flex-auto bg-[#0485ea] hover:bg-[#0375d1]"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          New Work Order
        </Button>
      </PageHeader>

      <WorkOrderDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onWorkOrderAdded={onWorkOrderAdded}
      />
    </>
  );
};

export default WorkOrdersHeader;
