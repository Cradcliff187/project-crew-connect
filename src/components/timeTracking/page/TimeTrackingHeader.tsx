
import { Search, Filter, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/layout/PageHeader';

interface TimeTrackingHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
}

const TimeTrackingHeader = ({
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType
}: TimeTrackingHeaderProps) => {
  return (
    <PageHeader
      title="Time Tracking"
      description="Log and manage time for projects and work orders"
    >
      <div className="relative w-full md:w-auto flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="Search entries..." 
          className="pl-9 subtle-input rounded-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="flex items-center gap-2 w-full md:w-auto">
        <Select 
          value={filterType} 
          onValueChange={setFilterType}
        >
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entries</SelectItem>
            <SelectItem value="work_orders">Work Orders Only</SelectItem>
            <SelectItem value="projects">Projects Only</SelectItem>
          </SelectContent>
        </Select>
        
        <Button variant="outline" size="sm" className="hidden md:flex">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </PageHeader>
  );
};

export default TimeTrackingHeader;
