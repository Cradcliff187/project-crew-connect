
import { useState } from 'react';
import { Search, Filter, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProjectDialog from './ProjectDialog';
import PageHeader from '@/components/layout/PageHeader';

interface ProjectsHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onProjectAdded: () => void;
}

const ProjectsHeader = ({ 
  searchQuery, 
  setSearchQuery,
  onProjectAdded
}: ProjectsHeaderProps) => {
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  
  return (
    <>
      <PageHeader
        title="Projects"
        description="Manage your active and completed projects"
      >
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
          <Button 
            size="sm" 
            className="flex-1 md:flex-auto bg-[#0485ea] hover:bg-[#0375d1]"
            onClick={() => setShowProjectDialog(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Project
          </Button>
        </div>
      </PageHeader>

      <ProjectDialog 
        open={showProjectDialog} 
        onOpenChange={setShowProjectDialog}
        onProjectAdded={onProjectAdded}
      />
    </>
  );
};

export default ProjectsHeader;
