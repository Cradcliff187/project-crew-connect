import { PlusCircle, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import CreateProjectWizard from './createWizard/CreateProjectWizard';
import PageHeader from '@/components/layout/PageHeader';

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
    <>
      <PageHeader title="Projects" description="Manage construction and maintenance projects">
        <SearchInput
          placeholder="Search projects..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          containerClassName="w-full sm:w-auto flex-1 max-w-sm"
        />

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => console.log('View schedule')}
            className="hidden md:flex"
          >
            <CalendarClock className="mr-1 h-4 w-4" aria-hidden="true" />
            Schedule
          </Button>

          <Button onClick={openAddDialog} size="sm" variant="default">
            <PlusCircle className="mr-1 h-4 w-4" aria-hidden="true" />
            New Project
          </Button>
        </div>
      </PageHeader>

      {showAddDialog && (
        <CreateProjectWizard
          isOpen={showAddDialog}
          onClose={closeAddDialog}
          onProjectCreated={() => {
            onProjectAdded();
            closeAddDialog();
          }}
        />
      )}
    </>
  );
};

export default ProjectsHeader;
