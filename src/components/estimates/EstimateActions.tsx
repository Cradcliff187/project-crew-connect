
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DownloadCloud, 
  Mail, 
  FileText, 
  MoreVertical,
  Edit,
  Trash2,
  Send,
  Check,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EstimateActionsProps {
  status: string;
  onEdit?: () => void;
  onConvert?: () => void;
  onDelete?: () => void;
}

const EstimateActions: React.FC<EstimateActionsProps> = ({ 
  status,
  onEdit,
  onConvert,
  onDelete
}) => {
  const isEditable = status === 'draft';
  const isConvertible = status === 'approved';
  const isPending = status === 'sent' || status === 'pending';

  return (
    <div className="flex gap-2 items-center">
      {isEditable && onEdit && (
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit className="h-4 w-4 mr-1" /> Edit
        </Button>
      )}
      
      {isConvertible && onConvert && (
        <Button 
          size="sm" 
          variant="default"
          className="bg-[#0485ea] hover:bg-[#0375d1]"
          onClick={onConvert}
        >
          <FileText className="h-4 w-4 mr-1" /> Convert to Project
        </Button>
      )}
      
      <Button variant="outline" size="sm">
        <Mail className="h-4 w-4 mr-1" /> Email
      </Button>
      
      <Button variant="outline" size="sm">
        <DownloadCloud className="h-4 w-4 mr-1" /> Download
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isEditable && onEdit && (
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Estimate
            </DropdownMenuItem>
          )}
          
          {isConvertible && onConvert && (
            <DropdownMenuItem onClick={onConvert}>
              <FileText className="h-4 w-4 mr-2" />
              Convert to Project
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className="text-red-600" 
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default EstimateActions;
