import { PlusCircle, Search, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProjectDialog from './ProjectDialog';

interface ProjectsHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onProjectAdded: () => void;
  showAddDialog?: boolean;
  setShowAddDialog?: (show: boolean) => void;
}

const ProjectsHeader = ({
  searchQuery,
  setSearchQuery,
  onProjectAdded,
  showAddDialog = false,
  setShowAddDialog = () => {},
}: ProjectsHeaderProps) => {
  const openAddDialog = () => {
    if (setShowAddDialog) {
      setShowAddDialog(true);
    }
  };

  const closeAddDialog = () => {
    if (setShowAddDialog) {
      setShowAddDialog(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="relative w-full sm:w-auto flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search projects..."
          className="pl-8 bg-white w-full"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <Button
          variant="outline"
          onClick={() => console.log('View schedule')}
          className="hidden md:flex"
        >
          <CalendarClock className="mr-2 h-4 w-4" />
          Schedule
        </Button>

        <Button onClick={openAddDialog} className="bg-[#0485ea] hover:bg-[#0375d1]">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {showAddDialog && (
        <ProjectDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onProjectSaved={onProjectAdded}
        />
      )}
    </div>
  );
};

export default ProjectsHeader;
