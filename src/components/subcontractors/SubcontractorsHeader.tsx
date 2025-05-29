import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Tag } from 'lucide-react';
import SubcontractorSheet from './SubcontractorSheet';
import SpecialtyDialog from './SpecialtyDialog';
import { SearchInput } from '@/components/ui/search-input';

interface SubcontractorsHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSubcontractorAdded: () => void;
  onSpecialtyAdded: () => void;
}

const SubcontractorsHeader = ({
  searchQuery,
  setSearchQuery,
  onSubcontractorAdded,
  onSpecialtyAdded,
}: SubcontractorsHeaderProps) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSpecialtyDialog, setShowSpecialtyDialog] = useState(false);

  const handleSubcontractorAdded = () => {
    onSubcontractorAdded();
    setShowAddDialog(false);
  };

  const handleSpecialtyAdded = () => {
    onSpecialtyAdded();
    setShowSpecialtyDialog(false);
  };

  return (
    <>
      {/* Clean Search and Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <SearchInput
          placeholder="Search subcontractors..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          containerClassName="w-full sm:w-auto flex-1 max-w-md"
        />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSpecialtyDialog(true)}
            className="font-opensans"
          >
            <Tag className="h-4 w-4 mr-1" />
            Manage Specialties
          </Button>

          <Button
            onClick={() => setShowAddDialog(true)}
            size="sm"
            className="bg-[#0485ea] hover:bg-[#0375d1] font-opensans"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Subcontractor
          </Button>
        </div>
      </div>

      <SubcontractorSheet
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubcontractorAdded={handleSubcontractorAdded}
      />

      <SpecialtyDialog
        open={showSpecialtyDialog}
        onOpenChange={setShowSpecialtyDialog}
        onSpecialtyAdded={handleSpecialtyAdded}
      />
    </>
  );
};

export default SubcontractorsHeader;
