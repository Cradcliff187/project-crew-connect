
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Building, MapPin, Upload, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { FileUpload } from '@/components/ui/file-upload';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

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

const timeEntryFormSchema = z.object({
  entityType: z.enum(['work_order', 'project']),
  entityId: z.string().min(1, "Please select a work order or project"),
  workDate: z.date(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  hoursWorked: z.number().min(0.01, "Hours must be greater than 0"),
  notes: z.string().optional(),
});

type TimeEntryFormValues = z.infer<typeof timeEntryFormSchema>;

const TimeEntryForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<WorkOrderOrProject[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrderOrProject[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmationData, setConfirmationData] = useState<TimeEntryFormValues | null>(null);
  
  const form = useForm<TimeEntryFormValues>({
    resolver: zodResolver(timeEntryFormSchema),
    defaultValues: {
      entityType: 'work_order',
      workDate: new Date(),
      startTime: '',
      endTime: '',
      hoursWorked: 0,
      notes: '',
    },
  });
  
  const entityType = form.watch('entityType');
  const entityId = form.watch('entityId');
  const startTime = form.watch('startTime');
  const endTime = form.watch('endTime');
  
  // Calculate hours worked when start/end time changes
  useEffect(() => {
    if (startTime && endTime) {
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      let hours = endHour - startHour;
      let minutes = endMinute - startMinute;
      
      if (minutes < 0) {
        hours -= 1;
        minutes += 60;
      }
      
      if (hours < 0) {
        hours += 24; // Handle overnight shifts
      }
      
      const totalHours = hours + (minutes / 60);
      form.setValue('hoursWorked', parseFloat(totalHours.toFixed(2)));
    }
  }, [startTime, endTime, form]);
  
  // Load projects and work orders
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch work orders
        const { data: workOrdersData, error: workOrdersError } = await supabase
          .from('maintenance_work_orders')
          .select('work_order_id, title, description, status, customer_id, location_id')
          .order('created_at', { ascending: false });
        
        if (workOrdersError) throw workOrdersError;
        
        // Fetch projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('projectid, projectname, jobdescription, status, customerid, sitelocationaddress, sitelocationcity, sitelocationstate')
          .order('created_at', { ascending: false });
        
        if (projectsError) throw projectsError;
        
        // Format work orders
        const formattedWorkOrders = workOrdersData.map(wo => ({
          id: wo.work_order_id,
          title: wo.title,
          description: wo.description,
          status: wo.status,
          // We would need to do a follow-up query to get location details
          // For now, we'll use placeholders
          location: 'Location details will be fetched',
        }));
        
        // Format projects
        const formattedProjects = projectsData.map(project => ({
          id: project.projectid,
          title: project.projectname,
          description: project.jobdescription,
          status: project.status,
          address: project.sitelocationaddress,
          city: project.sitelocationcity,
          state: project.sitelocationstate,
          location: [project.sitelocationcity, project.sitelocationstate].filter(Boolean).join(', '),
        }));
        
        setWorkOrders(formattedWorkOrders);
        setProjects(formattedProjects);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error loading data',
          description: 'Could not load work orders and projects.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };
  
  const handleFileClear = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const getSelectedEntityDetails = () => {
    if (!entityId) return null;
    
    if (entityType === 'work_order') {
      return workOrders.find(wo => wo.id === entityId);
    } else {
      return projects.find(proj => proj.id === entityId);
    }
  };
  
  const handleSubmit = (data: TimeEntryFormValues) => {
    setConfirmationData(data);
    setShowConfirmDialog(true);
  };
  
  const confirmSubmit = async () => {
    if (!confirmationData) return;
    
    setIsLoading(true);
    
    try {
      const timeEntry = {
        [entityType === 'work_order' ? 'work_order_id' : 'projectid']: confirmationData.entityId,
        hours_worked: confirmationData.hoursWorked,
        work_date: format(confirmationData.workDate, 'yyyy-MM-dd'),
        start_time: confirmationData.startTime,
        end_time: confirmationData.endTime,
        notes: confirmationData.notes,
        created_at: new Date().toISOString(),
      };
      
      if (entityType === 'work_order') {
        const { error } = await supabase
          .from('work_order_time_logs')
          .insert(timeEntry);
          
        if (error) throw error;
      } else {
        // For projects, we use the timelogs table
        const { error } = await supabase
          .from('timelogs')
          .insert({
            projectid: confirmationData.entityId,
            dateworked: format(confirmationData.workDate, 'yyyy-MM-dd'),
            starttime: confirmationData.startTime,
            endtime: confirmationData.endTime,
            totalhours: confirmationData.hoursWorked.toString(),
            // Additional fields would need to be set based on your requirements
          });
          
        if (error) throw error;
      }
      
      // Upload receipts if any
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `receipts/${entityType}/${confirmationData.entityId}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('construction_documents')
            .upload(filePath, file);
            
          if (uploadError) throw uploadError;
          
          // Link document to the entity
          const { data: { publicUrl } } = supabase.storage
            .from('construction_documents')
            .getPublicUrl(filePath);
            
          const { error: documentError } = await supabase
            .from('documents')
            .insert({
              file_name: file.name,
              file_type: file.type,
              file_size: file.size,
              storage_path: filePath,
              entity_type: entityType.toUpperCase(),
              entity_id: confirmationData.entityId,
              category: 'receipt',
              notes: `Receipt for work on ${format(confirmationData.workDate, 'MMMM d, yyyy')}`,
              is_expense: true,
            });
            
          if (documentError) throw documentError;
        }
      }
      
      toast({
        title: 'Time entry submitted',
        description: 'Your time entry has been successfully recorded.',
      });
      
      // Reset form
      form.reset({
        entityType: 'work_order',
        workDate: new Date(),
        startTime: '',
        endTime: '',
        hoursWorked: 0,
        notes: '',
      });
      setSelectedFiles([]);
      setShowConfirmDialog(false);
      
    } catch (error: any) {
      console.error('Error submitting time entry:', error);
      toast({
        title: 'Error submitting time entry',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getEntityOptions = () => {
    const entities = entityType === 'work_order' ? workOrders : projects;
    return entities.map(entity => (
      <HoverCard key={entity.id}>
        <HoverCardTrigger asChild>
          <SelectItem value={entity.id}>
            {entity.title || `${entityType === 'work_order' ? 'Work Order' : 'Project'} ${entity.id}`}
          </SelectItem>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="space-y-2">
            <h4 className="font-medium">{entity.title}</h4>
            {entity.status && (
              <div className="text-xs rounded-full bg-amber-100 text-amber-800 inline-block px-2 py-1">
                {entity.status}
              </div>
            )}
            {entity.description && (
              <p className="text-sm text-muted-foreground">
                {entity.description}
              </p>
            )}
            {entity.location && (
              <div className="flex items-center text-sm">
                <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <span>{entity.location}</span>
              </div>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>
    ));
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Log Time</CardTitle>
        </CardHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            {/* Entity Type Selection */}
            <div className="space-y-2">
              <Label>What are you logging time for?</Label>
              <RadioGroup
                value={entityType}
                onValueChange={(value: 'work_order' | 'project') => 
                  form.setValue('entityType', value, { shouldValidate: true })
                }
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="work_order" id="work_order" />
                  <Label htmlFor="work_order" className="cursor-pointer">Work Order</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="project" id="project" />
                  <Label htmlFor="project" className="cursor-pointer">Project</Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Entity Selection */}
            <div className="space-y-2">
              <Label htmlFor="entity">
                Select {entityType === 'work_order' ? 'Work Order' : 'Project'}
              </Label>
              <Select
                value={entityId}
                onValueChange={(value) => form.setValue('entityId', value, { shouldValidate: true })}
              >
                <SelectTrigger id="entity" className="w-full">
                  <SelectValue placeholder={`Select a ${entityType === 'work_order' ? 'work order' : 'project'}`} />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : getEntityOptions().length > 0 ? (
                    getEntityOptions()
                  ) : (
                    <SelectItem value="none" disabled>No {entityType === 'work_order' ? 'work orders' : 'projects'} found</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.entityId && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.entityId.message}</p>
              )}
              
              {/* Entity Details Preview */}
              {entityId && getSelectedEntityDetails() && (
                <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                  <div className="font-medium">{getSelectedEntityDetails()?.title}</div>
                  {getSelectedEntityDetails()?.location && (
                    <div className="flex items-center mt-1 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      <span>{getSelectedEntityDetails()?.location}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Date Selection */}
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
            
            {/* Time Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="startTime"
                    type="time"
                    className="pl-9"
                    {...form.register('startTime')}
                  />
                </div>
                {form.formState.errors.startTime && (
                  <p className="text-sm text-red-500">{form.formState.errors.startTime.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="endTime"
                    type="time"
                    className="pl-9"
                    {...form.register('endTime')}
                  />
                </div>
                {form.formState.errors.endTime && (
                  <p className="text-sm text-red-500">{form.formState.errors.endTime.message}</p>
                )}
              </div>
            </div>
            
            {/* Total Hours (Calculated) */}
            <div className="space-y-2">
              <Label htmlFor="hoursWorked">Total Hours</Label>
              <Input
                id="hoursWorked"
                type="number"
                step="0.01"
                readOnly
                value={form.watch('hoursWorked')}
                className="bg-muted"
              />
            </div>
            
            {/* Notes Field */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about the work performed..."
                {...form.register('notes')}
                rows={3}
              />
            </div>
            
            {/* Receipt Upload */}
            <div className="space-y-2">
              <Label>Add Receipts (Optional)</Label>
              <FileUpload
                onFilesSelected={handleFilesSelected}
                onFileClear={handleFileClear}
                selectedFiles={selectedFiles}
                allowMultiple={true}
                acceptedFileTypes="image/*,application/pdf"
                dropzoneText="Drag receipts here or click to upload"
              />
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-[#0485ea] hover:bg-[#0375d1]"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Review & Submit'}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Time Entry</DialogTitle>
            <DialogDescription>
              Please review the details before submitting
            </DialogDescription>
          </DialogHeader>
          
          {confirmationData && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Type:</div>
                <div className="font-medium capitalize">{confirmationData.entityType.replace('_', ' ')}</div>
                
                <div className="text-muted-foreground">Name:</div>
                <div className="font-medium">
                  {entityType === 'work_order' 
                    ? workOrders.find(wo => wo.id === confirmationData.entityId)?.title
                    : projects.find(p => p.id === confirmationData.entityId)?.title}
                </div>
                
                <div className="text-muted-foreground">Date:</div>
                <div className="font-medium">{format(confirmationData.workDate, 'MMMM d, yyyy')}</div>
                
                <div className="text-muted-foreground">Time:</div>
                <div className="font-medium">
                  {confirmationData.startTime} to {confirmationData.endTime}
                </div>
                
                <div className="text-muted-foreground">Hours:</div>
                <div className="font-medium">{confirmationData.hoursWorked}</div>
                
                {confirmationData.notes && (
                  <>
                    <div className="text-muted-foreground">Notes:</div>
                    <div className="font-medium">{confirmationData.notes}</div>
                  </>
                )}
                
                {selectedFiles.length > 0 && (
                  <>
                    <div className="text-muted-foreground">Receipts:</div>
                    <div className="font-medium">{selectedFiles.length} file(s) attached</div>
                  </>
                )}
              </div>
              
              <div className="bg-muted p-3 rounded-md">
                <div className="text-sm text-muted-foreground mb-1">Cost Calculation:</div>
                <div className="font-medium">
                  {confirmationData.hoursWorked} hours @ $XX.XX/hr = $XXX.XX
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  (Hourly rate based on your employee profile)
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Go Back
            </Button>
            <Button 
              onClick={confirmSubmit}
              className="bg-[#0485ea] hover:bg-[#0375d1]"
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Confirm & Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimeEntryForm;
