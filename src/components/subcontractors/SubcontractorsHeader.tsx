import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Tag } from 'lucide-react';
import SubcontractorSheet from './SubcontractorSheet';
import SpecialtyDialog from './SpecialtyDialog';
import PageHeader from '@/components/layout/PageHeader';
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
  const [addSubcontractorOpen, setAddSubcontractorOpen] = useState(false);
  const [specialtyDialogOpen, setSpecialtyDialogOpen] = useState(false);

  return (
    <>
      <PageHeader title="Subcontractors">
        <div className="flex gap-2 items-center flex-wrap">
          <SearchInput
            placeholder="Search subcontractors..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            containerClassName="w-[180px] sm:w-[300px]"
          />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setSpecialtyDialogOpen(true)}>
              <Tag className="h-4 w-4 mr-1" aria-hidden="true" />
              Add Specialty
            </Button>
            <Button size="sm" variant="default" onClick={() => setAddSubcontractorOpen(true)}>
              <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
              Add Subcontractor
            </Button>
          </div>
        </div>
      </PageHeader>

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
    </>
  );
};

export default SubcontractorsHeader;
