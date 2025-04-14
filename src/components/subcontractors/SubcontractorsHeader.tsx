import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Tag } from 'lucide-react';
import SubcontractorSheet from './SubcontractorSheet';
import SpecialtyDialog from './SpecialtyDialog';

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
  const [addSubcontractorOpen, setAddSubcontractorOpen] = useState(false);
  const [specialtyDialogOpen, setSpecialtyDialogOpen] = useState(false);

  return (
    <div className="flex justify-between items-center flex-wrap gap-4">
      <h1 className="text-2xl font-bold">Subcontractors</h1>

      <div className="flex gap-2 items-center flex-wrap">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search subcontractors..."
            className="w-[180px] sm:w-[300px] pl-8"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSpecialtyDialogOpen(true)}>
            <Tag className="h-4 w-4 mr-2" />
            Add Specialty
          </Button>

          <Button
            onClick={() => setAddSubcontractorOpen(true)}
            className="bg-[#0485ea] hover:bg-[#0375d1]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Subcontractor
          </Button>
        </div>
      </div>

      <SubcontractorSheet
        open={addSubcontractorOpen}
        onOpenChange={setAddSubcontractorOpen}
        onSubcontractorAdded={onSubcontractorAdded}
      />

      <SpecialtyDialog
        open={specialtyDialogOpen}
        onOpenChange={setSpecialtyDialogOpen}
        onSpecialtyAdded={onSpecialtyAdded}
      />
    </div>
  );
};

export default SubcontractorsHeader;
