
import React from 'react';
import { format } from 'date-fns';
import { formatTimeRange } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Receipt } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  employees: { employee_id: string; name: string; hourly_rate?: number }[];
  entityType: 'work_order' | 'project';
  workOrders: WorkOrderOrProject[];
  projects: WorkOrderOrProject[];
  isLoading: boolean;
  onConfirmWithReceipt: () => void;
  onConfirmWithoutReceipt: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onOpenChange,
  confirmationData,
  employees,
  entityType,
  workOrders,
  projects,
  isLoading,
  onConfirmWithReceipt,
  onConfirmWithoutReceipt
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

  const employeeInfo = confirmationData.employeeId && employees.length > 0
    ? employees.find(e => e.employee_id === confirmationData.employeeId)
    : undefined;

  const employeeName = employeeInfo?.name || 'Unknown';
  const employeeRate = employeeInfo?.hourly_rate;

  const laborCost = employeeRate 
    ? confirmationData.hoursWorked * employeeRate 
    : confirmationData.hoursWorked * 75;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Time Entry Confirmation</AlertDialogTitle>
          <AlertDialogDescription>
            Would you like to attach a receipt for this time entry?
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
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

            {employeeRate && (
              <>
                <div className="text-muted-foreground">Rate:</div>
                <div className="font-medium">${employeeRate.toFixed(2)}/hr</div>
              </>
            )}

            <div className="text-muted-foreground">Labor Cost:</div>
            <div className="font-medium">${laborCost.toFixed(2)}</div>
            
            {confirmationData.notes && (
              <>
                <div className="text-muted-foreground">Notes:</div>
                <div className="font-medium">{confirmationData.notes}</div>
              </>
            )}
          </div>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onConfirmWithoutReceipt} disabled={isLoading}>
            No Receipt
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirmWithReceipt}
            className="bg-[#0485ea] text-white"
            disabled={isLoading}
          >
            <Receipt className="h-4 w-4 mr-2" />
            {isLoading ? "Processing..." : "Upload Receipt"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationDialog;
