
import { Search, Filter, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProjectsHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const ProjectsHeader = ({ searchQuery, setSearchQuery }: ProjectsHeaderProps) => {
  return (
    <>
      <div className="flex flex-col gap-2 mb-6 animate-in">
        <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
        <p className="text-muted-foreground">
          Manage your active and completed projects
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 animate-in" style={{ animationDelay: '0.1s' }}>
        <div className="relative w-full md:w-auto flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search projects..." 
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
          <Button size="sm" className="flex-1 md:flex-auto bg-[#0485ea] hover:bg-[#0375d1]">
            <Plus className="h-4 w-4 mr-1" />
            New Project
          </Button>
        </div>
      </div>
    </>
  );
};

export default ProjectsHeader;
