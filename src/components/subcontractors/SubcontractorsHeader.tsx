
import { useState } from 'react';
import { Search, Plus, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/layout/PageHeader';
import SubcontractorDialog from './SubcontractorDialog';
import SpecialtyDialog from './SpecialtyDialog';

interface SubcontractorsHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSubcontractorAdded: () => void;
  onSpecialtyAdded?: () => void;
}

const SubcontractorsHeader = ({
  searchQuery,
  setSearchQuery,
  onSubcontractorAdded,
  onSpecialtyAdded = () => {}
}: SubcontractorsHeaderProps) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSpecialtyDialog, setShowSpecialtyDialog] = useState(false);
  
  return (
    <>
      <PageHeader
        title="Subcontractors"
        description="Manage your subcontractors and their specialties"
      >
        <div className="relative w-full md:w-auto flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search subcontractors..."
            className="pl-9 subtle-input rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSpecialtyDialog(true)}
            className="flex items-center gap-1"
          >
            <Tag className="h-4 w-4 mr-1" />
            Specialties
          </Button>
          
          <Button
            size="sm"
            className="flex-1 md:flex-auto bg-[#0485ea] hover:bg-[#0375d1]"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Subcontractor
          </Button>
        </div>
      </PageHeader>

      <SubcontractorDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubcontractorAdded={onSubcontractorAdded}
      />

      <SpecialtyDialog
        open={showSpecialtyDialog}
        onOpenChange={setShowSpecialtyDialog}
        onSpecialtyAdded={onSpecialtyAdded}
      />
    </>
  );
};

export default SubcontractorsHeader;
