import { PlusCircle, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import CreateProjectWizard from './createWizard/CreateProjectWizard';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

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

  const handleViewSchedule = () => {
    navigate('/scheduling');
  };

  return (
    <>
      {/* Clean Search and Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <SearchInput
          placeholder="Search projects..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          containerClassName="w-full sm:w-auto flex-1 max-w-md"
        />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewSchedule}
            className="font-opensans"
          >
            <CalendarClock className="mr-1 h-4 w-4" aria-hidden="true" />
            Schedule
          </Button>

          <Button
            onClick={openAddDialog}
            size="sm"
            variant="default"
            className="bg-[#0485ea] hover:bg-[#0375d1] font-opensans"
          >
            <PlusCircle className="mr-1 h-4 w-4" aria-hidden="true" />
            New Project
          </Button>
        </div>
      </div>

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
