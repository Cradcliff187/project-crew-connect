import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { formatTimeRange } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Upload, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileUpload } from '@/components/ui/file-upload';
import { TimeEntryFormValues } from '../hooks/useTimeEntryForm';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EntityType } from '@/components/documents/schemas/documentSchema';
import EntitySelector from '@/components/timeTracking/form/EntitySelector';

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
  selectedFiles: File[];
  isLoading: boolean;
  onConfirm: () => void;
  onUploadReceipts: () => void;
  hasReceipts: boolean;
  setHasReceipts: (value: boolean) => void;
  handleFilesSelected: (files: File[]) => void;
  handleFileClear: (index: number) => void;
}

const receiptMetadataSchema = z.object({
  vendorId: z.string().min(1, "A vendor is required for material receipts"),
  amount: z.number().min(0.01, "Amount must be greater than 0").optional(),
});

type ReceiptMetadata = z.infer<typeof receiptMetadataSchema>;

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
  setHasReceipts,
  handleFilesSelected,
  handleFileClear
}) => {
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const receiptForm = useForm<ReceiptMetadata>({
    resolver: zodResolver(receiptMetadataSchema),
    defaultValues: {
      vendorId: '',
      amount: undefined,
    }
  });

  useEffect(() => {
    if (open) {
      setValidationError(null);
    } else {
      receiptForm.reset();
      setShowFileUpload(false);
    }
  }, [open, receiptForm]);

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

  const toggleFileUpload = () => {
    setShowFileUpload(!showFileUpload);
  };

  const getReceiptMetadata = () => {
    const formData = receiptForm.getValues();
    return {
      vendorId: formData.vendorId,
      amount: formData.amount || 0
    };
  };

  const handleConfirm = () => {
    if (hasReceipts && selectedFiles.length > 0) {
      const isValid = receiptForm.trigger();
      if (!isValid) {
        setValidationError("Please select a vendor for the receipt");
        return;
      }

      const metadata = getReceiptMetadata();
      localStorage.setItem('timeEntryReceiptMetadata', JSON.stringify(metadata));
    } else {
      localStorage.removeItem('timeEntryReceiptMetadata');
    }
    setValidationError(null);
    onConfirm();
  };

  const laborCost = employeeRate 
    ? confirmationData.hoursWorked * employeeRate 
    : confirmationData.hoursWorked * 75;

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
          
          <div className="flex items-center justify-between space-x-2 rounded-md border p-4 mt-4">
            <div>
              <h4 className="font-medium">Include Material Receipt(s)</h4>
              <p className="text-sm text-muted-foreground">
                Do you have any material receipts to upload for this time entry?
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Switch
                checked={hasReceipts}
                onCheckedChange={(checked) => {
                  setHasReceipts(checked);
                  if (!checked) {
                    setShowFileUpload(false);
                    setValidationError(null);
                  }
                }}
                className="data-[state=checked]:bg-[#0485ea]"
              />
              {hasReceipts && (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="gap-1"
                  onClick={toggleFileUpload}
                >
                  <Upload className="h-4 w-4" />
                  {selectedFiles.length > 0 ? 'Change Receipts' : 'Upload Receipts'}
                </Button>
              )}
            </div>
          </div>
          
          {hasReceipts && showFileUpload && (
            <div className="p-3 border rounded-md bg-muted/30">
              <h4 className="text-sm font-medium mb-2">Upload Material Receipts</h4>
              <FileUpload
                onFilesSelected={handleFilesSelected}
                onFileClear={handleFileClear}
                selectedFiles={selectedFiles}
                allowMultiple={true}
                acceptedFileTypes="image/*,application/pdf"
                dropzoneText="Drop receipts here or click to browse"
              />
            </div>
          )}
          
          {hasReceipts && selectedFiles.length > 0 && (
            <FormProvider {...receiptForm}>
              <div className="p-3 border rounded-md">
                <h4 className="text-sm font-medium mb-2">Receipt Details</h4>
                <div className="space-y-3">
                  <FormField
                    control={receiptForm.control}
                    name="vendorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vendor (Required) <span className="text-red-500">*</span></FormLabel>
                        <EntitySelector
                          control={receiptForm.control}
                          entityType="VENDOR"
                          entityId={field.value}
                          fieldName="vendorId"
                          label=""
                          required={true}
                          workOrders={[]}
                          projects={[]}
                          isLoading={false}
                          onChange={field.onChange}
                        />
                        <FormDescription>
                          Select the vendor who supplied the materials
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={receiptForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Receipt Amount</FormLabel>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={field.value === undefined ? '' : field.value}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? undefined : parseFloat(value));
                            }}
                            placeholder="0.00"
                            className="pl-8"
                          />
                        </div>
                        <FormDescription>
                          Enter the total amount on the receipt
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </FormProvider>
          )}
          
          {selectedFiles.length > 0 && !showFileUpload && (
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
          
          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}
          
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
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
