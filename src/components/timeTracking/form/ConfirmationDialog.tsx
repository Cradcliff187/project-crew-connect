
import React, { useState } from 'react';
import { format } from 'date-fns';
import { formatTimeRange } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TimeEntryFormValues } from '../hooks/useTimeEntryForm';

interface WorkOrderOrProject {
  id: string;
  title: string;
  location?: string;
  address?: string;
  city?: string;
  state?: string;
  description?: string;
  status?: string;
}

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  confirmationData: TimeEntryFormValues | null;
  employees: { employee_id: string; name: string; }[];
  entityType: 'work_order' | 'project';
  workOrders: WorkOrderOrProject[];
  projects: WorkOrderOrProject[];
  selectedFiles: File[];
  isLoading: boolean;
  onConfirm: () => void;
  onUploadReceipts: () => void;
  hasReceipts: boolean;
  setHasReceipts: (value: boolean) => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onOpenChange,
  confirmationData,
  employees,
  entityType,
  workOrders,
  projects,
  selectedFiles,
  isLoading,
  onConfirm,
  onUploadReceipts,
  hasReceipts,
  setHasReceipts
}) => {
  if (!confirmationData) return null;

  const entityName = entityType === 'work_order' 
    ? workOrders.find(wo => wo.id === confirmationData.entityId)?.title
    : projects.find(p => p.id === confirmationData.entityId)?.title;

  const entityLocation = entityType === 'work_order'
    ? workOrders.find(wo => wo.id === confirmationData.entityId)?.location
    : projects.find(p => p.id === confirmationData.entityId)?.location || 
      (projects.find(p => p.id === confirmationData.entityId)?.city && projects.find(p => p.id === confirmationData.entityId)?.state ? 
        `${projects.find(p => p.id === confirmationData.entityId)?.city}, ${projects.find(p => p.id === confirmationData.entityId)?.state}` : 
        undefined);

  const employeeName = confirmationData.employeeId && employees.length > 0
    ? employees.find(e => e.employee_id === confirmationData.employeeId)?.name || 'Unknown'
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Time Entry</DialogTitle>
          <DialogDescription>
            Please review the details before submitting
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Type:</div>
            <div className="font-medium capitalize">{confirmationData.entityType.replace('_', ' ')}</div>
            
            <div className="text-muted-foreground">Name:</div>
            <div className="font-medium">
              {entityName || `Unknown ${confirmationData.entityType}`}
            </div>
            
            {entityLocation && (
              <>
                <div className="text-muted-foreground">Location:</div>
                <div className="font-medium">{entityLocation}</div>
              </>
            )}
            
            <div className="text-muted-foreground">Date:</div>
            <div className="font-medium">
              {format(confirmationData.workDate, "MMMM d, yyyy")}
            </div>
            
            <div className="text-muted-foreground">Time:</div>
            <div className="font-medium">
              {formatTimeRange(confirmationData.startTime, confirmationData.endTime)}
            </div>
            
            <div className="text-muted-foreground">Duration:</div>
            <div className="font-medium">
              {confirmationData.hoursWorked} hours
            </div>
            
            {employeeName && (
              <>
                <div className="text-muted-foreground">Employee:</div>
                <div className="font-medium">{employeeName}</div>
              </>
            )}
            
            {confirmationData.notes && (
              <>
                <div className="text-muted-foreground">Notes:</div>
                <div className="font-medium">{confirmationData.notes}</div>
              </>
            )}
          </div>
          
          {/* Receipt Upload Option */}
          <div className="flex items-center justify-between space-x-2 rounded-md border p-4 mt-4">
            <div>
              <h4 className="font-medium">Include Receipt(s)</h4>
              <p className="text-sm text-muted-foreground">
                Do you have any receipts to upload for this time entry?
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Switch
                checked={hasReceipts}
                onCheckedChange={setHasReceipts}
                className="data-[state=checked]:bg-[#0485ea]"
              />
              {hasReceipts && (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="gap-1"
                  onClick={onUploadReceipts}
                >
                  <Upload className="h-4 w-4" />
                  {selectedFiles.length > 0 ? 'Change Receipts' : 'Upload Receipts'}
                </Button>
              )}
            </div>
          </div>
          
          {selectedFiles.length > 0 && (
            <div className="rounded-md bg-muted p-3">
              <div className="text-sm font-medium">Attached Receipts:</div>
              <div className="text-xs text-muted-foreground">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="mt-1">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={onConfirm} 
              className="bg-[#0485ea] hover:bg-[#0375d1]"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Submit Time Entry'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
