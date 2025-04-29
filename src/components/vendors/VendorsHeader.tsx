import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Building2 } from 'lucide-react';
import VendorSheet from './VendorSheet';
import PageHeader from '@/components/layout/PageHeader';

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
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search vendors..."
              className="w-[180px] sm:w-[300px] pl-8"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <Button size="sm" variant="default" onClick={() => setAddVendorOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
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
