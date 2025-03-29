
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStatusHistory } from '@/hooks/useStatusHistory';

export interface StatusOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface UniversalStatusControlProps {
  entityId: string;
  entityType: 'PROJECT' | 'WORK_ORDER' | 'CHANGE_ORDER' | 'CONTACT';
  currentStatus: string;
  statusOptions: StatusOption[];
  tableName: string;
  idField: string;
  statusField?: string;
  onStatusChange: () => void;
  additionalUpdateFields?: Record<string, any>;
  className?: string;
  size?: 'sm' | 'default';
  showStatusBadge?: boolean;
  buttonLabel?: string;
  recordHistory?: boolean;
  userIdentifier?: string;
  notes?: string;
}

const UniversalStatusControl: React.FC<UniversalStatusControlProps> = ({
  entityId,
  entityType,
  currentStatus,
  statusOptions,
  tableName,
  idField,
  statusField = 'status',
  onStatusChange,
  additionalUpdateFields = {},
  className = '',
  size = 'default',
  showStatusBadge = true,
  buttonLabel = 'Change Status',
  recordHistory = true,
  userIdentifier,
  notes
}) => {
  const [updating, setUpdating] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { recordStatusChange } = useStatusHistory({
    entityId,
    entityType
  });

  const handleStatusChange = async (newStatus: string) => {
    // If the status hasn't changed, just close the dropdown and return
    if (newStatus === currentStatus) {
      setOpen(false);
      return;
    }

    setUpdating(true);
    try {
      console.log(`Updating ${entityType} ${entityId} status to ${newStatus}`);
      
      // Prepare the update data
      const updateData: Record<string, any> = {
        [statusField]: newStatus,
        updated_at: new Date().toISOString(),
        ...additionalUpdateFields
      };
      
      // Special case: If changing to "COMPLETED" for work orders or projects, set progress to 100%
      if ((entityType === 'WORK_ORDER' || entityType === 'PROJECT') && 
          newStatus.toUpperCase() === 'COMPLETED') {
        if (entityType === 'WORK_ORDER') {
          updateData.progress = 100;
        } else if (entityType === 'PROJECT') {
          // For projects, we'll update the progress table after the main update
        }
      }
      
      // Update the entity in the database - using type assertion for tableName
      const { error } = await supabase
        .from(tableName as any)
        .update(updateData)
        .eq(idField, entityId);
      
      if (error) throw error;
      
      // Special case for projects when status is "COMPLETED": Update progress to 100%
      if (entityType === 'PROJECT' && newStatus.toUpperCase() === 'COMPLETED') {
        await updateProjectProgress(entityId);
      }
      
      // Manually record the status change if requested
      // This is a fallback for entities that don't have database triggers for status history
      if (recordHistory && entityType === 'CHANGE_ORDER') {
        await recordStatusChange(
          newStatus,
          currentStatus,
          userIdentifier,
          notes
        );
      }
      
      // Find the status label for the toast message
      const statusOption = statusOptions.find(opt => opt.value === newStatus);
      const statusLabel = statusOption?.label || newStatus;
      
      toast({
        title: 'Status Updated',
        description: `Status changed to ${statusLabel.toLowerCase()}.${
          (entityType === 'WORK_ORDER' || entityType === 'PROJECT') && 
          newStatus.toUpperCase() === 'COMPLETED' ? 
          ' Progress automatically set to 100%.' : ''
        }`,
        className: 'bg-[#0485ea]',
      });
      
      setOpen(false);
      onStatusChange();
    } catch (error: any) {
      console.error('Error updating status:', error);
      
      toast({
        title: 'Error Updating Status',
        description: error.message || 'Failed to update status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };
  
  // Helper function to update project progress to 100%
  const updateProjectProgress = async (projectId: string) => {
    try {
      // Check if a progress record exists
      const { data: progressData } = await supabase
        .from('project_progress' as any)
        .select('id')
        .eq('projectid', projectId)
        .maybeSingle();
      
      if (progressData) {
        // Update existing record
        await supabase
          .from('project_progress' as any)
          .update({ progress_percentage: 100 })
          .eq('projectid', projectId);
      } else {
        // Create new progress record with 100%
        await supabase
          .from('project_progress' as any)
          .insert({ 
            projectid: projectId, 
            progress_percentage: 100 
          });
      }
    } catch (error) {
      console.error('Error updating project progress to 100%:', error);
      // We don't want to fail the status update if progress update fails,
      // so we just log the error and continue
    }
  };

  // Filter out the current status from options
  const availableStatusOptions = statusOptions.filter(option => 
    option.value.toLowerCase() !== currentStatus.toLowerCase()
  );

  return (
    <div className={cn("flex items-center relative z-10", className)}>
      {showStatusBadge && (
        <StatusBadge status={currentStatus.toLowerCase() as any} />
      )}
      
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size={size} 
            disabled={updating || availableStatusOptions.length === 0}
            className={cn(
              "ml-2 border-[#0485ea]/30 hover:border-[#0485ea] hover:bg-[#0485ea]/10",
              size === 'sm' ? "text-xs px-2 h-7" : ""
            )}
          >
            {updating ? 'Updating...' : buttonLabel}
            <ChevronDown className={cn("ml-1", size === 'sm' ? "h-3 w-3" : "h-4 w-4")} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[180px]">
          {availableStatusOptions.length > 0 ? (
            availableStatusOptions.map((option) => (
              <DropdownMenuItem 
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className="cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center">
                  {option.icon && <span className="mr-2">{option.icon}</span>}
                  <span>{option.label}</span>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="py-2 px-3 text-sm text-muted-foreground">
              No status options available
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UniversalStatusControl;
