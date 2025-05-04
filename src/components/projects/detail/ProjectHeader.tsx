import React from 'react';
// import { Database } from '@/integrations/supabase/types'; // Remove complex type import
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PlusCircle, Plus, FilePlus, FileText, Edit, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '@/components/common/status/StatusBadge';

// Define a simpler Project type for this component
type Project = {
  projectid: string;
  projectname?: string | null;
  status?: string;
};

interface ProjectHeaderProps {
  project: Project; // Use the simpler type
  customerName?: string | null;
  customerId?: string | null;
  onAddExpenseClick: () => void;
  onAddChangeOrderClick: () => void;
  onAddDocumentClick: () => void;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  customerName,
  customerId,
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
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">{project.projectname}</h2>
          <StatusBadge status={project.status || 'PENDING'} />
        </div>
        <div className="flex items-center gap-4 mt-1">
          <p className="text-sm text-muted-foreground">Project ID: {project.projectid}</p>

          {customerName && (
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-medium">{customerName}</span>
              {customerId && <span className="text-xs text-muted-foreground">({customerId})</span>}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={handleEditClick}>
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
