
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import StatusBadge from './StatusBadge';
import StatusHistoryDialog from './StatusHistoryDialog';
import StatusTransitionPrompt from './StatusTransitionPrompt';
import { toast } from '@/hooks/use-toast';

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
  recordHistory?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showStatusBadge?: boolean;
  additionalUpdateFields?: (newStatus: string) => Record<string, any>;
  className?: string;
  notes?: string;
}

const UniversalStatusControl: React.FC<StatusControlProps> = ({
  entityId,
  entityType,
  currentStatus,
  statusOptions = [], // Provide default empty array to prevent undefined issues
  tableName,
  idField,
  onStatusChange,
  recordHistory = false,
  size = 'md',
  showStatusBadge = true,
  additionalUpdateFields,
  className = '',
  notes
}) => {
  const [open, setOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showTransitionPrompt, setShowTransitionPrompt] = useState(false);
  const [transitionNotes, setTransitionNotes] = useState('');
  
  // Ensure statusOptions is never undefined to prevent Array.from errors
  const safeStatusOptions = statusOptions || [];
  
  // Safeguard against undefined statusOptions
  const filteredStatusOptions = safeStatusOptions.filter(option => option?.value !== currentStatus);
  
  const handleStatusChange = async (newStatus: string) => {
    setPendingStatus(newStatus);
    setShowTransitionPrompt(true);
  };
  
  const confirmStatusChange = async () => {
    if (!pendingStatus) return;
    
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
        const { error: historyError } = await supabase
          .from('activitylog')
          .insert({
            action: 'Status Change',
            moduletype: entityType,
            referenceid: entityId,
            status: pendingStatus,
            previousstatus: currentStatus,
            timestamp: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            detailsjson: transitionNotes ? JSON.stringify({ notes: transitionNotes }) : null
          });
        
        if (historyError) {
          console.error('Error recording status history:', historyError);
        }
      }
      
      toast({
        title: 'Status Updated',
        description: `Status changed to ${pendingStatus}`,
      });
      
      onStatusChange();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Could not update status: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setOpen(false);
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
  
  const getStatusLabel = (status: string): string => {
    const option = safeStatusOptions.find(opt => opt?.value === status);
    return option?.label || status;
  };
  
  const getStatusColor = (status: string): string => {
    const option = safeStatusOptions.find(opt => opt?.value === status);
    return option?.color || 'neutral';
  };
  
  return (
    <div className={`flex items-center ${className}`}>
      {showStatusBadge && (
        <StatusBadge 
          label={getStatusLabel(currentStatus)}
          color={getStatusColor(currentStatus)}
        />
      )}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'default'}
            role="combobox"
            aria-expanded={open}
            className="w-[150px] justify-between ml-2"
            disabled={loading}
          >
            {getStatusLabel(currentStatus)}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search status..." />
            <CommandEmpty>No status found.</CommandEmpty>
            <CommandGroup>
              {filteredStatusOptions.map((status) => (
                <CommandItem
                  key={status.value}
                  value={status.value}
                  onSelect={() => handleStatusChange(status.value)}
                >
                  <Check
                    className="mr-2 h-4 w-4"
                    style={{color: status.color}}
                    aria-hidden="true"
                  />
                  {status.label}
                </CommandItem>
              ))}
            </CommandGroup>
            {loading && (
              <div className="flex items-center justify-center p-2">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Status...
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
      
      {recordHistory && (
        <Button 
          variant="ghost" 
          size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'default'}
          className="ml-2"
          onClick={() => setShowHistory(true)}
        >
          History
        </Button>
      )}
      
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
