import React from 'react';
import { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PlusCircle, Plus, FilePlus, FileText } from 'lucide-react';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectHeaderProps {
  project: Project;
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
  return (
    <div className="flex items-center justify-between w-full">
      <div>
        <h3 className="text-lg font-semibold">{project.projectname}</h3>
        <p className="text-sm text-muted-foreground">Project ID: {project.projectid}</p>
      </div>
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
  );
};

export default ProjectHeader;
