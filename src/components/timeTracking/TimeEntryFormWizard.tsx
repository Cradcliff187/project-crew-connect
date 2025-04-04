
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Timer, Upload, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

import EntityTypeSelector from './form/EntityTypeSelector';
import EntitySelector from './form/EntitySelector';
import TimeRangeSelector from './form/TimeRangeSelector';
import ReceiptUploader from './form/ReceiptUploader';
import { useTimeEntryForm } from './hooks/useTimeEntryForm';
import { useEntityData } from './hooks/useEntityData';

interface TimeEntryFormWizardProps {
  onSuccess: () => void;
}

const TimeEntryFormWizard: React.FC<TimeEntryFormWizardProps> = ({ onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [hasReceipts, setHasReceipts] = useState(false);
  const {
    form,
    isLoading,
    selectedFiles,
    handleFilesSelected,
    handleFileClear,
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
  const selectedEntity = getSelectedEntityDetails();

  const nextStep = () => {
    if (currentStep === 1 && !entityId) {
      form.setError('entityId', { 
        type: 'required', 
        message: `Please select a ${entityType === 'work_order' ? 'work order' : 'project'}` 
      });
      return;
    }
    
    if (currentStep === 2 && (!startTime || !endTime)) {
      if (!startTime) form.setError('startTime', { type: 'required', message: 'Start time is required' });
      if (!endTime) form.setError('endTime', { type: 'required', message: 'End time is required' });
      return;
    }
    
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  const submitForm = () => {
    handleSubmit(form.getValues(), selectedFiles, hasReceipts);
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center space-x-2 mb-4">
        {[1, 2, 3, 4].map(step => (
          <div
            key={step}
            className={`w-2.5 h-2.5 rounded-full ${
              step === currentStep ? 'bg-[#0485ea]' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <CardHeader>
              <CardTitle>Step 1: Select Work</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={nextStep} 
                className="bg-[#0485ea] hover:bg-[#0375d1]"
                disabled={!entityId}
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </>
        );
      case 2:
        return (
          <>
            <CardHeader>
              <CardTitle>Step 2: Time Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button 
                onClick={nextStep} 
                className="bg-[#0485ea] hover:bg-[#0375d1]"
                disabled={!startTime || !endTime}
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </>
        );
      case 3:
        return (
          <>
            <CardHeader>
              <CardTitle>Step 3: Notes & Receipts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about the work performed..."
                  {...form.register('notes')}
                  rows={3}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2 rounded-md border p-4">
                <div>
                  <h4 className="font-medium">Attach Receipt(s)</h4>
                  <p className="text-sm text-muted-foreground">
                    Do you have any receipts to upload for this time entry?
                  </p>
                </div>
                <Switch
                  checked={hasReceipts}
                  onCheckedChange={setHasReceipts}
                  className="data-[state=checked]:bg-[#0485ea]"
                />
              </div>
              
              {hasReceipts && (
                <ReceiptUploader
                  selectedFiles={selectedFiles}
                  onFilesSelected={handleFilesSelected}
                  onFileClear={handleFileClear}
                />
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button 
                onClick={nextStep} 
                className="bg-[#0485ea] hover:bg-[#0375d1]"
              >
                Review <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </>
        );
      case 4:
        return (
          <>
            <CardHeader>
              <CardTitle>Step 4: Review & Submit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted rounded-md p-4">
                  <div className="grid grid-cols-2 gap-y-2">
                    <div className="text-sm text-muted-foreground">Type:</div>
                    <div className="text-sm font-medium capitalize">{entityType.replace('_', ' ')}</div>
                    
                    <div className="text-sm text-muted-foreground">Name:</div>
                    <div className="text-sm font-medium">{selectedEntity?.title || entityId}</div>
                    
                    <div className="text-sm text-muted-foreground">Date:</div>
                    <div className="text-sm font-medium">
                      {format(form.watch('workDate'), "MMMM d, yyyy")}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">Time:</div>
                    <div className="text-sm font-medium">
                      {startTime} - {endTime}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">Duration:</div>
                    <div className="text-sm font-medium">
                      {hoursWorked.toFixed(2)} hours
                    </div>
                    
                    {form.watch('employeeId') && employees.length > 0 && (
                      <>
                        <div className="text-sm text-muted-foreground">Employee:</div>
                        <div className="text-sm font-medium">
                          {employees.find(e => e.employee_id === form.watch('employeeId'))?.name}
                        </div>
                      </>
                    )}
                    
                    {form.watch('notes') && (
                      <>
                        <div className="text-sm text-muted-foreground">Notes:</div>
                        <div className="text-sm font-medium">{form.watch('notes')}</div>
                      </>
                    )}
                    
                    <div className="text-sm text-muted-foreground">Receipts:</div>
                    <div className="text-sm font-medium">
                      {hasReceipts && selectedFiles.length > 0 ? `${selectedFiles.length} file(s) attached` : 'None'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button 
                onClick={submitForm} 
                className="bg-[#0485ea] hover:bg-[#0375d1]"
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit Time Entry'} <Check className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      {renderStepIndicator()}
      {renderStepContent()}
    </Card>
  );
};

export default TimeEntryFormWizard;
