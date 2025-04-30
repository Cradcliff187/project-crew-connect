import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Building2 } from 'lucide-react';
import VendorSheet from './VendorSheet';
import PageHeader from '@/components/layout/PageHeader';
import { SearchInput } from '@/components/ui/search-input';

interface VendorsHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onVendorAdded: () => void;
}

const VendorsHeader = ({ searchQuery, setSearchQuery, onVendorAdded }: VendorsHeaderProps) => {
  const [addVendorOpen, setAddVendorOpen] = useState(false);

  return (
    <>
      <PageHeader title="Vendors">
        <div className="flex gap-2 items-center flex-wrap">
          <SearchInput
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            containerClassName="w-[180px] sm:w-[300px]"
          />

          <Button size="sm" variant="default" onClick={() => setAddVendorOpen(true)}>
            <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
            Add Vendor
          </Button>
        </div>
      </PageHeader>

      <VendorSheet
        open={addVendorOpen}
        onOpenChange={setAddVendorOpen}
        onVendorAdded={onVendorAdded}
      />
    </>
  );
};

export default VendorsHeader;
