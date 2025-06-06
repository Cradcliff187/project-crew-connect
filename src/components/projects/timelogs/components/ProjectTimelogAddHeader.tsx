import { useState } from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Clock } from 'lucide-react';
import ProjectTimelogAddSheet from './ProjectTimelogAddSheet';
import { Employee } from '@/types/common';

interface ProjectTimelogAddHeaderProps {
  projectId: string;
  employees: Employee[];
  onTimeLogAdded: () => void;
}

export const ProjectTimelogAddHeader = ({
  projectId,
  employees,
  onTimeLogAdded,
}: ProjectTimelogAddHeaderProps) => {
  const [showAddSheet, setShowAddSheet] = useState(false);

  return (
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-lg">Time Tracking</CardTitle>
      <Button
        onClick={() => setShowAddSheet(true)}
        size="sm"
        className="bg-[#0485ea] hover:bg-[#0375d1]"
      >
        <Plus className="h-4 w-4 mr-2" />
        Log Time
      </Button>

      <ProjectTimelogAddSheet
        open={showAddSheet}
        onOpenChange={setShowAddSheet}
        projectId={projectId}
        employees={employees}
        onSuccess={onTimeLogAdded}
      />
    </CardHeader>
  );
};

export default ProjectTimelogAddHeader;
