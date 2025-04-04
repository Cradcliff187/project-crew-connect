
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  Timer, 
  Upload, 
  CheckCircle2, 
  Clock, 
  Receipt, 
  Briefcase,
  User,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

import EntityTypeSelector from './form/EntityTypeSelector';
import EntitySelector from './form/EntitySelector';
import TimeRangeSelector from './form/TimeRangeSelector';
import ReceiptUploader from './form/ReceiptUploader';
import { useTimeEntryForm } from './hooks/useTimeEntryForm';
import { useEntityData } from './hooks/useEntityData';
import ReceiptMetadataForm from './form/ReceiptMetadataForm';

interface TimeEntryFormWizardProps {
  onSuccess: () => void;
}

const steps = [
  { id: 'work', title: 'Work Details', icon: Briefcase },
  { id: 'time', title: 'Time & Date', icon: Clock },
  { id: 'receipts', title: 'Receipts', icon: Receipt },
  { id: 'review', title: 'Review', icon: CheckCircle2 },
];

const TimeEntryFormWizard: React.FC<TimeEntryFormWizardProps> = ({ onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const {
    form,
    isLoading,
    selectedFiles,
    receiptMetadata,
    handleFilesSelected,
    handleFileClear,
    updateReceiptMetadata,
    handleSubmit,
  } = useTimeEntryForm(onSuccess);

  const {
    workOrders,
    projects,
    employees,
    isLoadingEntities,
    getSelectedEntityDetails
  } = useEntityData(form);

  // Watch form values
  const entityType = form.watch('entityType');
  const entityId = form.watch('entityId');
  const startTime = form.watch('startTime');
  const endTime = form.watch('endTime');
  const hoursWorked = form.watch('hoursWorked');
  const hasReceipts = form.watch('hasReceipts');
  const selectedEntity = getSelectedEntityDetails();

  // Calculate completion percentage for the progress bar
  const getProgressPercent = () => {
    return Math.round(((currentStep + 1) / steps.length) * 100);
  };

  // Navigation functions with validation
  const nextStep = () => {
    // Validate current step
    let canProceed = true;
    let errorMessage = '';

    if (currentStep === 0 && !entityId) {
      canProceed = false;
      errorMessage = `Please select a ${entityType === 'work_order' ? 'work order' : 'project'}`;
      form.setError('entityId', { 
        type: 'required', 
        message: errorMessage
      });
    }
    
    if (currentStep === 1 && (!startTime || !endTime)) {
      canProceed = false;
      if (!startTime) {
        form.setError('startTime', { type: 'required', message: 'Start time is required' });
        errorMessage = 'Please select start and end times';
      }
      if (!endTime) {
        form.setError('endTime', { type: 'required', message: 'End time is required' });
        errorMessage = errorMessage || 'Please select start and end times';
      }
    }
    
    if (!canProceed) {
      toast({
        title: "Missing information",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prevStep => prevStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prevStep => prevStep - 1);
    }
  };
  
  const goToStep = (index: number) => {
    // Only allow going to completed steps or next step
    if (index <= currentStep + 1) {
      setCurrentStep(index);
    }
  };

  // Handle form submission
  const onFormSubmit = () => {
    handleSubmit(form.getValues());
  };

  // Render step header and navigation
  const renderStepHeader = () => {
    return (
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const isPending = index > currentStep;
            
            return (
              <div 
                key={step.id} 
                className={cn(
                  "flex flex-col items-center cursor-pointer transition-all",
                  {
                    "text-[#0485ea] font-medium": isActive,
                    "text-muted-foreground": !isActive && !isCompleted,
                    "text-green-500": isCompleted,
                  }
                )}
                onClick={() => goToStep(index)}
              >
                <div 
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border mb-1",
                    {
                      "bg-[#0485ea] text-white border-[#0485ea]": isActive,
                      "bg-green-500 text-white border-green-500": isCompleted,
                      "border-muted-foreground": isPending,
                    }
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                </div>
                <span className="text-xs hidden sm:block">{step.title}</span>
              </div>
            );
          })}
        </div>
        <Progress value={getProgressPercent()} className="h-2 mb-4" />
      </div>
    );
  };

  // Render the content for each step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Work Details
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-[#0485ea]">Work Details</h2>
              <p className="text-sm text-muted-foreground">Select the work order or project you worked on</p>
            </div>
            
            <div className="space-y-4">
              <EntityTypeSelector 
                entityType={entityType} 
                onChange={(value) => form.setValue('entityType', value, { shouldValidate: true })}
              />
              
              <EntitySelector
                entityType={entityType}
                entityId={entityId}
                workOrders={workOrders}
                projects={projects}
                isLoading={isLoadingEntities}
                onChange={(value) => form.setValue('entityId', value, { shouldValidate: true })}
                error={form.formState.errors.entityId?.message}
                selectedEntity={selectedEntity}
              />
              
              <div className="space-y-2">
                <Label htmlFor="employee">Employee</Label>
                <select
                  id="employee"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={form.watch('employeeId') || ''}
                  onChange={(e) => form.setValue('employeeId', e.target.value, { shouldValidate: true })}
                >
                  <option value="">Select Employee</option>
                  {employees.map(employee => (
                    <option key={employee.employee_id} value={employee.employee_id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedEntity && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <h3 className="font-medium mb-1">Selected {entityType === 'work_order' ? 'Work Order' : 'Project'}</h3>
                  <p className="text-sm font-medium">{selectedEntity.title}</p>
                  {selectedEntity.location && (
                    <p className="text-xs text-muted-foreground">{selectedEntity.location}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        );
        
      case 1: // Time & Date
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-[#0485ea]">Time & Date</h2>
              <p className="text-sm text-muted-foreground">When did you perform this work?</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !form.watch('workDate') && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch('workDate') ? (
                        format(form.watch('workDate'), "MMMM d, yyyy")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={form.watch('workDate')}
                      onSelect={(date) => date && form.setValue('workDate', date, { shouldValidate: true })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Time Range</Label>
                  {startTime && endTime && (
                    <div className="flex items-center text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                      <Timer className="h-3.5 w-3.5 mr-1" />
                      <span>Duration: {hoursWorked.toFixed(2)} hours</span>
                    </div>
                  )}
                </div>
                
                <TimeRangeSelector
                  startTime={startTime}
                  endTime={endTime}
                  onStartTimeChange={(value) => {
                    form.setValue('startTime', value, { shouldValidate: true });
                    
                    // Automatically adjust end time if needed
                    if (endTime) {
                      const [startHour, startMinute] = value.split(':').map(Number);
                      const [endHour, endMinute] = endTime.split(':').map(Number);
                      const startTotal = startHour * 60 + startMinute;
                      const endTotal = endHour * 60 + endMinute;
                      
                      if (endTotal <= startTotal && endTotal > startTotal - 120) {
                        let newEndHour = startHour + 1;
                        if (newEndHour >= 24) newEndHour -= 24;
                        const newEndTime = `${newEndHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
                        form.setValue('endTime', newEndTime, { shouldValidate: true });
                      }
                    }
                  }}
                  onEndTimeChange={(value) => form.setValue('endTime', value, { shouldValidate: true })}
                  startTimeError={form.formState.errors.startTime?.message}
                  endTimeError={form.formState.errors.endTime?.message}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hoursWorked">Total Hours</Label>
                <Input
                  id="hoursWorked"
                  type="number"
                  step="0.01"
                  readOnly
                  value={hoursWorked}
                  className="bg-muted"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about the work performed..."
                  {...form.register('notes')}
                  rows={3}
                />
              </div>
            </div>
          </div>
        );
        
      case 2: // Receipts
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-[#0485ea]">Receipts & Documents</h2>
              <p className="text-sm text-muted-foreground">
                Do you have any receipts or documents related to this work?
              </p>
            </div>
            
            <div className="flex items-center justify-between space-x-2 rounded-md border p-4">
              <div>
                <h4 className="font-medium">Attach Receipt(s)</h4>
                <p className="text-sm text-muted-foreground">
                  Toggle on if you have receipts to upload
                </p>
              </div>
              <Switch
                checked={hasReceipts}
                onCheckedChange={(checked) => form.setValue('hasReceipts', checked)}
                className="data-[state=checked]:bg-[#0485ea]"
              />
            </div>
            
            {hasReceipts && (
              <div className="space-y-4">
                <ReceiptUploader
                  selectedFiles={selectedFiles}
                  onFilesSelected={handleFilesSelected}
                  onFileClear={handleFileClear}
                />
                
                {selectedFiles.length > 0 && (
                  <ReceiptMetadataForm
                    metadata={receiptMetadata}
                    updateMetadata={updateReceiptMetadata}
                    entityType={entityType}
                  />
                )}
              </div>
            )}
            
            {!hasReceipts && (
              <div className="flex items-center p-4 border rounded-md bg-muted/50">
                <AlertCircle className="h-5 w-5 mr-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  You can continue without attaching any receipts. Toggle the switch above if you need to add receipts.
                </p>
              </div>
            )}
          </div>
        );
        
      case 3: // Review
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-[#0485ea]">Review & Submit</h2>
              <p className="text-sm text-muted-foreground">
                Please review your time entry before submitting.
              </p>
            </div>
            
            <div className="space-y-3 bg-muted rounded-md p-4">
              <div className="grid grid-cols-2 gap-y-2">
                <div className="text-sm font-medium">Type:</div>
                <div className="text-sm capitalize">{entityType.replace('_', ' ')}</div>
                
                <div className="text-sm font-medium">Name:</div>
                <div className="text-sm">{selectedEntity?.title || entityId}</div>
                
                <div className="text-sm font-medium">Date:</div>
                <div className="text-sm">
                  {format(form.watch('workDate'), "MMMM d, yyyy")}
                </div>
                
                <div className="text-sm font-medium">Time:</div>
                <div className="text-sm">
                  {startTime} - {endTime} ({hoursWorked.toFixed(2)} hours)
                </div>
                
                {form.watch('employeeId') && employees.length > 0 && (
                  <>
                    <div className="text-sm font-medium">Employee:</div>
                    <div className="text-sm">
                      {employees.find(e => e.employee_id === form.watch('employeeId'))?.name}
                    </div>
                  </>
                )}
              </div>
              
              {form.watch('notes') && (
                <div className="pt-2 border-t">
                  <div className="text-sm font-medium mb-1">Notes:</div>
                  <div className="text-sm">{form.watch('notes')}</div>
                </div>
              )}
              
              <div className="pt-2 border-t">
                <div className="text-sm font-medium mb-1">Receipts:</div>
                {hasReceipts && selectedFiles.length > 0 ? (
                  <div>
                    <Badge className="mb-1 bg-[#0485ea]">{selectedFiles.length} receipt(s) attached</Badge>
                    <div className="text-xs text-muted-foreground">
                      {receiptMetadata.expenseType && (
                        <span>Type: {receiptMetadata.expenseType}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm">None</div>
                )}
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {renderStepHeader()}
        
        <ScrollArea className="pr-4" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          {renderStepContent()}
        </ScrollArea>
        
        <div className="flex justify-between mt-6 pt-4 border-t">
          {currentStep > 0 && (
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={isLoading}
            >
              Previous
            </Button>
          )}
          
          {currentStep === 0 && (
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={isLoading}
              className="opacity-0 cursor-default"
            >
              Previous
            </Button>
          )}
          
          {currentStep < steps.length - 1 ? (
            <Button 
              className="bg-[#0485ea] hover:bg-[#0375d1]"
              onClick={nextStep}
              disabled={isLoading}
            >
              Next
            </Button>
          ) : (
            <Button 
              className="bg-[#0485ea] hover:bg-[#0375d1]"
              onClick={onFormSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit Time Entry"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeEntryFormWizard;
