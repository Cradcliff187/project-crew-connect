import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import StatusBadge from './StatusBadge';
import StatusHistoryDialog from './StatusHistoryDialog';
import StatusTransitionPrompt from './StatusTransitionPrompt';
import { toast } from '@/hooks/use-toast';
import { StatusType } from '@/types/common';

// Restore StatusOption interface definition
export interface StatusOption {
  value: string;
  label: string;
  color?: string;
  description?: string;
  canTransitionTo?: string[];
  requiresApproval?: boolean;
}

export interface StatusControlProps {
  entityId: string;
  entityType: string;
  currentStatus: string;
  statusOptions: StatusOption[];
  tableName: string;
  idField: string;
  onStatusChange: () => void;
  onAfterStatusChange?: (newStatus: string) => Promise<void>;
  recordHistory?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showStatusBadge?: boolean;
  additionalUpdateFields?: (newStatus: string) => Record<string, any>;
  className?: string;
  notes?: string;
}

// Define transition maps directly in the component or import from a constants file
const workOrderTransitionMap: Record<string, string[]> = {
  NEW: ['IN_PROGRESS', 'ON_HOLD', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'ON_HOLD', 'CANCELLED'],
  ON_HOLD: ['IN_PROGRESS', 'CANCELLED'],
  COMPLETED: ['IN_PROGRESS'], // Example: Allow reopening
  CANCELLED: ['NEW'],
};

const changeOrderTransitionMap: Record<string, string[]> = {
  DRAFT: ['SUBMITTED', 'CANCELLED', 'APPROVED'],
  SUBMITTED: ['REVIEW', 'CANCELLED'],
  REVIEW: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['IMPLEMENTED', 'CANCELLED', 'DRAFT', 'REJECTED'],
  REJECTED: ['DRAFT', 'CANCELLED'],
  IMPLEMENTED: ['CANCELLED'],
  CANCELLED: ['DRAFT'],
};

// Add other entity transition maps as needed (PROJECT, VENDOR, etc.)

const UniversalStatusControl: React.FC<StatusControlProps> = ({
  entityId,
  entityType,
  currentStatus,
  statusOptions = [],
  tableName,
  idField,
  onStatusChange,
  onAfterStatusChange,
  recordHistory = false,
  size = 'md',
  showStatusBadge = true,
  additionalUpdateFields,
  className = '',
  notes,
}) => {
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showTransitionPrompt, setShowTransitionPrompt] = useState(false);
  const [transitionNotes, setTransitionNotes] = useState('');

  // Ensure statusOptions is always an array - used for labels/colors
  const safeStatusOptions = Array.isArray(statusOptions) ? statusOptions : [];
  console.log('[UniversalStatusControl] safeStatusOptions:', safeStatusOptions);

  // Determine valid next statuses based on internal logic
  const getValidTransitions = (type: string, status: string): string[] => {
    let map: Record<string, string[]> = {};
    if (type === 'WORK_ORDER') map = workOrderTransitionMap;
    else if (type === 'CHANGE_ORDER') map = changeOrderTransitionMap;
    // Add other entity types here

    // Return allowed transitions or default to an empty array if status not in map
    return map[status] || [];
  };

  const validTransitions = getValidTransitions(entityType, currentStatus);
  console.log('[UniversalStatusControl] validTransitions:', validTransitions);

  // Filter the provided statusOptions based on validTransitions derived here
  const filteredStatusOptions = safeStatusOptions.filter(
    option => option && option.value && validTransitions.includes(option.value)
  );
  console.log(
    '[UniversalStatusControl] filteredStatusOptions for dropdown:',
    filteredStatusOptions
  );

  // Add another safety check before mapping
  const validFilteredOptionsForRender = Array.isArray(filteredStatusOptions)
    ? filteredStatusOptions
    : [];

  // handleStatusChange only sets state for the prompt
  const handleStatusChange = useCallback((newStatus: string) => {
    console.log('[UniversalStatusControl] handleStatusChange called with:', newStatus);
    setPendingStatus(newStatus);
    setShowTransitionPrompt(true);
    // setOpen(false); // No longer needed
  }, []);

  const confirmStatusChange = async () => {
    if (!pendingStatus) return;
    if (!entityId) {
      toast({
        title: 'Error',
        description: 'Entity ID is required to update status',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const updateFields: Record<string, any> = { status: pendingStatus };

      if (additionalUpdateFields) {
        const additionalFields = additionalUpdateFields(pendingStatus);
        for (const key in additionalFields) {
          updateFields[key] = additionalFields[key];
        }
      }

      // Automatically set progress to 100 if status is COMPLETED
      if (pendingStatus === 'COMPLETED' && entityType === 'WORK_ORDER') {
        updateFields.progress = 100;
      }

      // Use a type assertion to handle dynamic table names
      const { error } = await supabase
        .from(tableName as any)
        .update(updateFields)
        .eq(idField, entityId);

      if (error) {
        throw error;
      }

      if (recordHistory) {
        // Use activitylog table for history which is guaranteed to exist
        const { error: historyError } = await supabase.from('activitylog').insert({
          action: 'Status Change',
          moduletype: entityType,
          referenceid: entityId,
          status: pendingStatus,
          previousstatus: currentStatus,
          timestamp: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          detailsjson: transitionNotes ? JSON.stringify({ notes: transitionNotes }) : null,
        });

        if (historyError) {
          console.error('Error recording status history:', historyError);
        }
      }

      toast({
        title: 'Status Updated',
        description: `Status changed to ${pendingStatus}`,
      });

      // Call the standard onStatusChange callback
      if (typeof onStatusChange === 'function') {
        onStatusChange();
      }

      // Call the additional after-status-change handler if provided
      if (typeof onAfterStatusChange === 'function') {
        await onAfterStatusChange(pendingStatus);
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Could not update status: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setShowTransitionPrompt(false);
      setTransitionNotes('');
      setPendingStatus(null);
    }
  };

  const cancelStatusChange = () => {
    setShowTransitionPrompt(false);
    setPendingStatus(null);
    setTransitionNotes('');
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTransitionNotes(e.target.value);
  };

  // Use safeStatusOptions for getStatusLabel/Color as it contains all definitions
  const getStatusLabel = (status: string): string => {
    if (!status) return 'Unknown';
    const option = safeStatusOptions.find(opt => opt?.value === status);
    return option?.label || status;
  };

  // If no entity ID is provided, don't render the control
  if (!entityId) {
    return null;
  }

  return (
    <div className={`flex items-center ${className}`}>
      {showStatusBadge && (
        <StatusBadge status={currentStatus as StatusType} label={getStatusLabel(currentStatus)} />
      )}

      {/* Use DropdownMenu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'default'}
            role="combobox"
            // aria-expanded managed by DropdownMenuTrigger
            className="w-[150px] justify-between ml-2"
            disabled={loading || validFilteredOptionsForRender.length === 0}
            // Remove onClick={setOpen}
          >
            {getStatusLabel(currentStatus)}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]" align="start">
          {/* Directly map to DropdownMenuItems */}
          {validFilteredOptionsForRender.length === 0 && (
            <DropdownMenuItem disabled>No valid transitions</DropdownMenuItem>
          )}
          {validFilteredOptionsForRender.map((status, index) => {
            const itemValue = String(status.value);
            const itemLabel = status.label || itemValue;
            return (
              <DropdownMenuItem
                key={itemValue}
                // value={itemValue} // Not applicable to DropdownMenuItem
                onSelect={() => handleStatusChange(itemValue)} // Use onSelect here
                className="cursor-pointer" // Ensure it looks clickable
              >
                <Check
                  className="mr-2 h-4 w-4"
                  style={{ opacity: itemValue === currentStatus ? 1 : 0 }}
                  aria-hidden="true"
                />
                {itemLabel}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* History Button (no longer needs Popover) */}
      {recordHistory && (
        <Button
          variant="ghost"
          size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'default'}
          className="ml-2"
          onClick={() => setShowHistory(true)} // Directly control history dialog state
        >
          History
        </Button>
      )}

      {/* History Dialog (remains unchanged, controlled by showHistory state) */}
      <StatusHistoryDialog
        open={showHistory}
        onOpenChange={setShowHistory}
        entityId={entityId}
        entityType={entityType}
        tableName={tableName}
        idField={idField}
        currentStatus={currentStatus}
        statusOptions={safeStatusOptions}
      />

      {/* Transition Prompt Dialog (remains unchanged, controlled by showTransitionPrompt state) */}
      <StatusTransitionPrompt
        open={showTransitionPrompt}
        onOpenChange={setShowTransitionPrompt}
        onConfirm={confirmStatusChange}
        onCancel={cancelStatusChange}
        notes={transitionNotes}
        onNotesChange={handleNotesChange}
        statusOptions={safeStatusOptions}
        pendingStatus={pendingStatus || ''}
      />
    </div>
  );
};

export default UniversalStatusControl;
