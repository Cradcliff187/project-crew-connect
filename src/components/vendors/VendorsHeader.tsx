import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Building2 } from 'lucide-react';
import VendorSheet from './VendorSheet';

interface VendorsHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onVendorAdded: () => void;
}

const VendorsHeader = ({ searchQuery, setSearchQuery, onVendorAdded }: VendorsHeaderProps) => {
  const [addVendorOpen, setAddVendorOpen] = useState(false);

  return (
    <div className="flex justify-between items-center flex-wrap gap-4">
      <h1 className="text-2xl font-bold">Vendors</h1>

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

        <div className="flex gap-2">
          <Button
            onClick={() => setAddVendorOpen(true)}
            className="bg-[#0485ea] hover:bg-[#0375d1]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Vendor
          </Button>
        </div>
      </div>

      <VendorSheet
        open={addVendorOpen}
        onOpenChange={setAddVendorOpen}
        onVendorAdded={onVendorAdded}
      />
    </div>
  );
};

export default VendorsHeader;
