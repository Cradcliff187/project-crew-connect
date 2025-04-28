import React from 'react';
// import { Database } from '@/integrations/supabase/types'; // Remove complex type import
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PlusCircle, Plus, FilePlus, FileText, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Define a simpler Project type for this component
type Project = {
  projectid: string;
  projectname?: string | null;
};

interface ProjectHeaderProps {
  project: Project; // Use the simpler type
  onAddExpenseClick: () => void;
  onAddChangeOrderClick: () => void;
  onAddDocumentClick: () => void;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  onAddExpenseClick,
  onAddChangeOrderClick,
  onAddDocumentClick,
}) => {
  const navigate = useNavigate();

  const handleEditClick = () => {
    navigate(`/projects/${project.projectid}/edit`);
  };

  return (
    <div className="flex items-center justify-between w-full">
      <div>
        <h3 className="text-lg font-semibold">{project.projectname}</h3>
        <p className="text-sm text-muted-foreground">Project ID: {project.projectid}</p>
      </div>
      <div className="flex items-center gap-2">
        {' '}
        {/* Wrap buttons in a div for layout */}
        <Button size="sm" variant="outline" onClick={handleEditClick}>
          {' '}
          {/* Add Edit button */}
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onAddExpenseClick}>
              <PlusCircle className="h-4 w-4 mr-2" />
              <span>Add Expense</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAddChangeOrderClick}>
              <FilePlus className="h-4 w-4 mr-2" />
              <span>Add Change Order</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAddDocumentClick}>
              <FileText className="h-4 w-4 mr-2" />
              <span>Add Document</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ProjectHeader;
