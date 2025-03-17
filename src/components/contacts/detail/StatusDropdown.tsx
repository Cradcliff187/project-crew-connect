
import StatusBadge from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { ChevronDown } from '@/components/ui/chevron-down';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface StatusOption {
  value: string;
  label: string;
}

interface StatusDropdownProps {
  contact: any;
  onStatusChange: (contact: any, newStatus: string) => void;
  statusOptions: StatusOption[];
}

const StatusDropdown = ({ contact, onStatusChange, statusOptions }: StatusDropdownProps) => {
  if (!statusOptions.length) return null;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          Status: <StatusBadge className="ml-2" status={contact.status.toLowerCase() as any} size="sm" />
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {statusOptions.map((option) => (
          <DropdownMenuItem 
            key={option.value}
            onClick={() => onStatusChange(contact, option.value)}
          >
            <div className="flex items-center">
              <StatusBadge status={option.value.toLowerCase() as any} size="sm" />
              <span className="ml-2">{option.label}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusDropdown;
