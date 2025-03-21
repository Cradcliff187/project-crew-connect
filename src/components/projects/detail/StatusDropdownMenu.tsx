
import { Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface StatusOption {
  status: string;
  label: string;
}

interface StatusDropdownMenuProps {
  availableStatuses: StatusOption[];
  updating: boolean;
  onStatusChange: (newStatus: string) => void;
}

const StatusDropdownMenu = ({ 
  availableStatuses, 
  updating, 
  onStatusChange 
}: StatusDropdownMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={updating} className="ml-2">
          {updating ? 'Updating...' : 'Change Status'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableStatuses.map((statusOption) => (
          <DropdownMenuItem 
            key={statusOption.status}
            onClick={() => onStatusChange(statusOption.status)}
            className="cursor-pointer"
          >
            {statusOption.status === 'active' && <Check className="mr-2 h-4 w-4 text-green-500" />}
            {statusOption.status === 'on_hold' && <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />}
            {statusOption.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusDropdownMenu;
