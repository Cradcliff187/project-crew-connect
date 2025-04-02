
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import StatusBadge from './StatusBadge';
import { updateEntityStatus } from '@/utils/statusTransitions';
import { useStatusHistory, EntityType } from '@/hooks/useStatusHistory';
import { toast } from '@/hooks/use-toast';

// Export the StatusOption interface so other components can import it
export interface StatusOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface StatusControlProps {
  entityId: string;
  entityType: EntityType;
  currentStatus: string;
  statusOptions: StatusOption[];
  tableName: string;
  idField?: string;
  onStatusChange?: () => void;
  additionalUpdateFields?: Record<string, any> | ((newStatus: string) => Record<string, any>);
  size?: 'sm' | 'md' | 'lg';
  showStatusBadge?: boolean;
  buttonLabel?: string;
  recordHistory?: boolean;
  className?: string;
  userIdentifier?: string;
  notes?: string;
}

const UniversalStatusControl = ({
  entityId,
  entityType,
  currentStatus,
  statusOptions,
  tableName,
  idField = 'id',
  onStatusChange,
  additionalUpdateFields = {},
  size = 'md',
  showStatusBadge = false,
  buttonLabel,
  recordHistory = true,
  className = '',
  userIdentifier,
  notes
}: StatusControlProps) => {
  const [updating, setUpdating] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const { recordStatusChange } = useStatusHistory({ entityId, entityType });
  
  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    setOpenDropdown(false);
    
    try {
      // Get additional fields - can be an object or a function that returns an object
      const extraFields = typeof additionalUpdateFields === 'function' 
        ? additionalUpdateFields(newStatus) 
        : { ...additionalUpdateFields };
      
      // If moving to COMPLETED status, calculate additional fields
      if (newStatus === 'COMPLETED') {
        extraFields.progress = 100;
        extraFields.completed_date = new Date().toISOString();
      }
      
      // Update the entity status
      const success = await updateEntityStatus(
        entityType,
        entityId,
        currentStatus,
        newStatus,
        tableName,
        idField,
        'status',
        extraFields
      );
      
      if (success && recordHistory) {
        // Record the status change in the history
        await recordStatusChange(
          newStatus,
          currentStatus,
          userIdentifier || 'system', // Use provided user identifier or default
          notes || `Status changed from ${currentStatus} to ${newStatus}`
        );
      }
      
      // Notify parent component of the status change
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error: any) {
      console.error(`Error updating ${entityType} status:`, error);
      toast({
        title: "Status Update Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };
  
  // Size-specific classes
  const sizeClasses = {
    sm: {
      button: 'px-2 py-1 text-xs h-7',
      icon: 'h-3 w-3 ml-1',
      checkIcon: 'h-3 w-3 mr-1'
    },
    md: {
      button: 'px-3 py-1.5 text-sm h-9',
      icon: 'h-4 w-4 ml-1.5',
      checkIcon: 'h-4 w-4 mr-1.5' 
    },
    lg: {
      button: 'px-4 py-2 text-base h-10',
      icon: 'h-5 w-5 ml-2',
      checkIcon: 'h-5 w-5 mr-2'
    }
  };
  
  // Don't show dropdown if there are no status options
  if (statusOptions.length === 0) {
    return (
      <div className={`flex items-center ${className}`}>
        {showStatusBadge && (
          <StatusBadge status={currentStatus} entityType={entityType} size={size} />
        )}
        {!showStatusBadge && (
          <Button variant="outline" size="sm" disabled={true} className={className}>
            No Status Options
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={showStatusBadge ? "outline" : "default"}
          size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'default'}
          className={`${showStatusBadge ? "ml-2 border-muted" : ""} ${className}`}
          disabled={updating || statusOptions.length === 0}
        >
          {showStatusBadge ? (
            <>
              {buttonLabel || "Change Status"}
              <ChevronDown className={sizeClasses[size].icon} />
            </>
          ) : (
            <>
              {currentStatus}
              <ChevronDown className={sizeClasses[size].icon} />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuRadioGroup value={currentStatus} onValueChange={handleStatusChange}>
          {statusOptions.map((option) => (
            <DropdownMenuRadioItem 
              key={option.value} 
              value={option.value}
              className="cursor-pointer"
            >
              {option.icon || (
                <Check 
                  className={`${sizeClasses[size].checkIcon} opacity-0 group-data-[state=checked]:opacity-100`} 
                />
              )}
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UniversalStatusControl;
