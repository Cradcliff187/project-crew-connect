
import { useState } from 'react';
import { Search, Filter, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import VendorDialog from './VendorDialog';
import PageHeader from '@/components/layout/PageHeader';

interface VendorsHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onVendorAdded: () => void;
}

const VendorsHeader = ({ searchQuery, setSearchQuery, onVendorAdded }: VendorsHeaderProps) => {
  const [showVendorDialog, setShowVendorDialog] = useState(false);
  
  return (
    <>
      <PageHeader
        title="Vendors"
        description="Manage your suppliers and material vendors"
      >
        <div className="relative w-full md:w-auto flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search vendors..." 
            className="pl-9 subtle-input rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
            className="flex-1 md:flex-auto bg-[#0485ea] hover:bg-[#0375d1]"
            onClick={() => setShowVendorDialog(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Vendor
          </Button>
        </div>
      </PageHeader>
      
      {/* Vendor Dialog */}
      <VendorDialog 
        open={showVendorDialog} 
        onOpenChange={setShowVendorDialog} 
        onVendorAdded={onVendorAdded} 
      />
    </>
  );
};

export default VendorsHeader;
