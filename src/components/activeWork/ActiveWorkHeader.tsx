import { Search, Filter, ChevronDown, List, LayoutGrid } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ActiveWorkHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: 'table' | 'dashboard';
  setViewMode: (mode: 'table' | 'dashboard') => void;
}

const ActiveWorkHeader = ({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
}: ActiveWorkHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="relative w-full sm:w-auto flex-1 max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by name, client, ID or PO#..."
          className="pl-9 subtle-input rounded-md"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="flex items-center gap-1 font-opensans">
          <Filter className="h-4 w-4 mr-1" />
          Filter
          <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
        </Button>

        <div className="border rounded-md flex">
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className={viewMode === 'table' ? 'bg-[#0485ea] hover:bg-[#0375d1]' : ''}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'dashboard' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('dashboard')}
            className={viewMode === 'dashboard' ? 'bg-[#0485ea] hover:bg-[#0375d1]' : ''}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActiveWorkHeader;
