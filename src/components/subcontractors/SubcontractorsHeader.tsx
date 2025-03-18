
import { useState } from 'react';
import { Hammer, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SubcontractorDialog from './SubcontractorDialog';

interface SubcontractorsHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSubcontractorAdded: () => void;
}

const SubcontractorsHeader = ({
  searchQuery,
  setSearchQuery,
  onSubcontractorAdded
}: SubcontractorsHeaderProps) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center space-x-2">
          <Hammer className="h-6 w-6 text-[#0485ea]" />
          <h1 className="text-2xl font-bold tracking-tight">Subcontractors</h1>
        </div>
        
        <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search subcontractors..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button
            className="bg-[#0485ea] hover:bg-[#0375d1]"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Subcontractor
          </Button>
        </div>
      </div>

      <SubcontractorDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubcontractorAdded={onSubcontractorAdded}
      />
    </div>
  );
};

export default SubcontractorsHeader;
