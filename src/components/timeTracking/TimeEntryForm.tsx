
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Building, MapPin, Upload, FileText, Timer } from 'lucide-react';
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { cn, calculateHoursWorked, formatTimeRange } from '@/lib/utils';
import { TimeEntryFormData, TimeOption, TimeOfDay } from '@/types/timeTracking';

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

interface TimeEntryFormProps {
  onSuccess: () => void;
}

const timeEntryFormSchema = z.object({
  entityType: z.enum(['work_order', 'project']),
  entityId: z.string().min(1, "Please select a work order or project"),
  workDate: z.date(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  hoursWorked: z.number().min(0.01, "Hours must be greater than 0"),
  notes: z.string().optional(),
  employeeId: z.string().optional(),
});

type FormValues = z.infer<typeof timeEntryFormSchema>;

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<WorkOrderOrProject[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrderOrProject[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmationData, setConfirmationData] = useState<FormValues | null>(null);
  const [employees, setEmployees] = useState<{ employee_id: string, name: string }[]>([]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(timeEntryFormSchema),
    defaultValues: {
      entityType: 'work_order',
      workDate: new Date(),
      startTime: '',
      endTime: '',
      hoursWorked: 0,
      notes: '',
      employeeId: '',
    },
  });
  
  const entityType = form.watch('entityType');
  const entityId = form.watch('entityId');
  const startTime = form.watch('startTime');
  const endTime = form.watch('endTime');
  
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
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        const { data: workOrdersData, error: workOrdersError } = await supabase
          .from('maintenance_work_orders')
          .select('work_order_id, title, description, status, customer_id, location_id')
          .order('created_at', { ascending: false });
        
        if (workOrdersError) throw workOrdersError;
        
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('projectid, projectname, jobdescription, status, customerid, sitelocationaddress, sitelocationcity, sitelocationstate')
          .order('created_at', { ascending: false });
        
        if (projectsError) throw projectsError;
        
        const { data: employeesData, error: employeesError } = await supabase
          .from('employees')
          .select('employee_id, first_name, last_name, hourly_rate')
          .eq('status', 'ACTIVE')
          .order('last_name', { ascending: true });
          
        if (employeesError) throw employeesError;
        
        const formattedWorkOrders = workOrdersData.map(wo => ({
          id: wo.work_order_id,
          title: wo.title,
          description: wo.description,
          status: wo.status,
          location: 'Location details will be fetched',
        }));
        
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
        
        const formattedEmployees = employeesData.map(emp => ({
          employee_id: emp.employee_id,
          name: `${emp.first_name} ${emp.last_name}`
        }));
        
        setWorkOrders(formattedWorkOrders);
        setProjects(formattedProjects);
        setEmployees(formattedEmployees);
        
        if (formattedEmployees.length > 0 && !form.getValues('employeeId')) {
          form.setValue('employeeId', formattedEmployees[0].employee_id);
        }
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
  }, [form]);
  
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
  
  const handleSubmit = (data: FormValues) => {
    setConfirmationData(data);
    setShowConfirmDialog(true);
  };
  
  const confirmSubmit = async () => {
    if (!confirmationData) return;
    
    setIsLoading(true);
    
    try {
      const selectedEmployee = employees.find(e => e.employee_id === confirmationData.employeeId);
      
      let employeeRate = null;
      if (confirmationData.employeeId) {
        const { data: empData } = await supabase
          .from('employees')
          .select('hourly_rate')
          .eq('employee_id', confirmationData.employeeId)
          .maybeSingle();
        
        employeeRate = empData?.hourly_rate;
      }
      
      const timeEntry = {
        entity_type: confirmationData.entityType,
        entity_id: confirmationData.entityId,
        date_worked: format(confirmationData.workDate, 'yyyy-MM-dd'),
        start_time: confirmationData.startTime,
        end_time: confirmationData.endTime,
        hours_worked: confirmationData.hoursWorked,
        employee_id: confirmationData.employeeId || null,
        employee_rate: employeeRate,
        notes: confirmationData.notes,
        has_receipts: selectedFiles.length > 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: insertedEntry, error } = await supabase
        .from('time_entries')
        .insert(timeEntry)
        .select('id')
        .single();
        
      if (error) throw error;
      
      if (selectedFiles.length > 0 && insertedEntry) {
        for (const file of selectedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `receipts/time_entries/${insertedEntry.id}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('construction_documents')
            .upload(filePath, file);
            
          if (uploadError) throw uploadError;
          
          const { error: receiptError } = await supabase
            .from('time_entry_receipts')
            .insert({
              time_entry_id: insertedEntry.id,
              file_name: file.name,
              file_type: file.type,
              file_size: file.size,
              storage_path: filePath,
              uploaded_at: new Date().toISOString()
            });
            
          if (receiptError) throw receiptError;
        }
      }
      
      toast({
        title: 'Time entry submitted',
        description: 'Your time entry has been successfully recorded.',
      });
      
      form.reset({
        entityType: 'work_order',
        workDate: new Date(),
        startTime: '',
        endTime: '',
        hoursWorked: 0,
        notes: '',
        employeeId: employees.length > 0 ? employees[0].employee_id : undefined,
      });
      setSelectedFiles([]);
      setShowConfirmDialog(false);
      
      onSuccess();
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
  
  // Format a 24h time string to 12h format with AM/PM
  const formatTime = (time: string): string => {
    if (!time) return '';
    
    const [hoursStr, minutesStr] = time.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = minutesStr.padStart(2, '0');
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    
    return `${hours12}:${minutes} ${period}`;
  };
  
  // Determine time of day category
  const getTimeOfDay = (hours: number): TimeOfDay => {
    if (hours >= 5 && hours < 12) return 'morning';
    if (hours >= 12 && hours < 17) return 'afternoon';
    if (hours >= 17 && hours < 21) return 'evening';
    return 'night';
  };
  
  // Generate time options in 15-minute increments, grouped by time of day
  const generateTimeOptions = (): TimeOption[] => {
    const options: TimeOption[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        const value = `${formattedHour}:${formattedMinute}`;
        const timeOfDay = getTimeOfDay(hour);
        
        options.push({
          value,
          display: formatTime(value),
          timeOfDay
        });
      }
    }
    return options;
  };
  
  const timeOptions = generateTimeOptions();
  
  // Get valid end times (must be after start time)
  const getValidEndTimes = (): TimeOption[] => {
    if (!startTime) return timeOptions;
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const startTotalMinutes = (startHour * 60) + startMinute;
    
    return timeOptions.filter(option => {
      const [endHour, endMinute] = option.value.split(':').map(Number);
      const endTotalMinutes = (endHour * 60) + endMinute;
      
      // Allow overnight shifts (if end time is earlier than start time, assume it's the next day)
      return endTotalMinutes > startTotalMinutes || endTotalMinutes < startTotalMinutes - 120;
    });
  };
  
  // Display time duration between start and end times
  const getTimeDuration = (): string => {
    if (!startTime || !endTime) return '';
    
    const hours = calculateHoursWorked(startTime, endTime);
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    if (wholeHours === 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else if (minutes === 0) {
      return `${wholeHours} hour${wholeHours !== 1 ? 's' : ''}`;
    } else {
      return `${wholeHours} hour${wholeHours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
  };
  
  // Get color for time of day
  const getTimeOfDayColor = (timeOfDay: TimeOfDay): string => {
    switch (timeOfDay) {
      case 'morning': return 'bg-blue-50 text-blue-800';
      case 'afternoon': return 'bg-amber-50 text-amber-800';
      case 'evening': return 'bg-purple-50 text-purple-800';
      case 'night': return 'bg-slate-50 text-slate-800';
      default: return '';
    }
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Log Time</CardTitle>
        </CardHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
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
            
            <div className="space-y-2">
              <Label htmlFor="employee">Employee</Label>
              <Select
                value={form.watch('employeeId')}
                onValueChange={(value) => form.setValue('employeeId', value, { shouldValidate: true })}
              >
                <SelectTrigger id="employee" className="w-full">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(employee => (
                    <SelectItem key={employee.employee_id} value={employee.employee_id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
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
                    <span>Duration: {getTimeDuration()}</span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Select
                      value={form.watch('startTime')}
                      onValueChange={(value) => {
                        form.setValue('startTime', value, { shouldValidate: true });
                        
                        // If end time is before start time, automatically set to start time + 1 hour
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
                    >
                      <SelectTrigger id="startTime" className="w-full pl-9 bg-white">
                        <SelectValue placeholder="Select start time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel className="text-xs font-medium text-blue-600">Morning (5 AM - 12 PM)</SelectLabel>
                          {timeOptions
                            .filter(time => time.timeOfDay === 'morning')
                            .map((time) => (
                              <SelectItem 
                                key={`start-${time.value}`} 
                                value={time.value}
                                className="hover:bg-blue-50 transition-colors"
                              >
                                {time.display}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-xs font-medium text-amber-600 mt-2">Afternoon (12 PM - 5 PM)</SelectLabel>
                          {timeOptions
                            .filter(time => time.timeOfDay === 'afternoon')
                            .map((time) => (
                              <SelectItem 
                                key={`start-${time.value}`} 
                                value={time.value}
                                className="hover:bg-amber-50 transition-colors"
                              >
                                {time.display}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-xs font-medium text-purple-600 mt-2">Evening (5 PM - 9 PM)</SelectLabel>
                          {timeOptions
                            .filter(time => time.timeOfDay === 'evening')
                            .map((time) => (
                              <SelectItem 
                                key={`start-${time.value}`} 
                                value={time.value}
                                className="hover:bg-purple-50 transition-colors"
                              >
                                {time.display}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-xs font-medium text-slate-600 mt-2">Night (9 PM - 5 AM)</SelectLabel>
                          {timeOptions
                            .filter(time => time.timeOfDay === 'night')
                            .map((time) => (
                              <SelectItem 
                                key={`start-${time.value}`} 
                                value={time.value}
                                className="hover:bg-slate-50 transition-colors"
                              >
                                {time.display}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  {form.formState.errors.startTime && (
                    <p className="text-sm text-red-500">{form.formState.errors.startTime.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Select
                      value={form.watch('endTime')}
                      onValueChange={(value) => form.setValue('endTime', value, { shouldValidate: true })}
                    >
                      <SelectTrigger id="endTime" className="w-full pl-9 bg-white">
                        <SelectValue placeholder="Select end time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel className="text-xs font-medium text-blue-600">Morning (5 AM - 12 PM)</SelectLabel>
                          {getValidEndTimes()
                            .filter(time => time.timeOfDay === 'morning')
                            .map((time) => (
                              <HoverCard key={`end-hover-${time.value}`}>
                                <HoverCardTrigger asChild>
                                  <SelectItem 
                                    key={`end-${time.value}`} 
                                    value={time.value}
                                    className="hover:bg-blue-50 transition-colors"
                                  >
                                    {time.display}
                                  </SelectItem>
                                </HoverCardTrigger>
                                {startTime && (
                                  <HoverCardContent className="w-auto p-2">
                                    <p className="text-xs">
                                      Duration: {getTimeDuration()}
                                    </p>
                                  </HoverCardContent>
                                )}
                              </HoverCard>
                            ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-xs font-medium text-amber-600 mt-2">Afternoon (12 PM - 5 PM)</SelectLabel>
                          {getValidEndTimes()
                            .filter(time => time.timeOfDay === 'afternoon')
                            .map((time) => (
                              <HoverCard key={`end-hover-${time.value}`}>
                                <HoverCardTrigger asChild>
                                  <SelectItem 
                                    key={`end-${time.value}`} 
                                    value={time.value}
                                    className="hover:bg-amber-50 transition-colors"
                                  >
                                    {time.display}
                                  </SelectItem>
                                </HoverCardTrigger>
                                {startTime && (
                                  <HoverCardContent className="w-auto p-2">
                                    <p className="text-xs">
                                      Duration: {calculateHoursWorked(startTime, time.value).toFixed(2)} hours
                                    </p>
                                  </HoverCardContent>
                                )}
                              </HoverCard>
                            ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-xs font-medium text-purple-600 mt-2">Evening (5 PM - 9 PM)</SelectLabel>
                          {getValidEndTimes()
                            .filter(time => time.timeOfDay === 'evening')
                            .map((time) => (
                              <HoverCard key={`end-hover-${time.value}`}>
                                <HoverCardTrigger asChild>
                                  <SelectItem 
                                    key={`end-${time.value}`} 
                                    value={time.value}
                                    className="hover:bg-purple-50 transition-colors"
                                  >
                                    {time.display}
                                  </SelectItem>
                                </HoverCardTrigger>
                                {startTime && (
                                  <HoverCardContent className="w-auto p-2">
                                    <p className="text-xs">
                                      Duration: {calculateHoursWorked(startTime, time.value).toFixed(2)} hours
                                    </p>
                                  </HoverCardContent>
                                )}
                              </HoverCard>
                            ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-xs font-medium text-slate-600 mt-2">Night (9 PM - 5 AM)</SelectLabel>
                          {getValidEndTimes()
                            .filter(time => time.timeOfDay === 'night')
                            .map((time) => (
                              <HoverCard key={`end-hover-${time.value}`}>
                                <HoverCardTrigger asChild>
                                  <SelectItem 
                                    key={`end-${time.value}`} 
                                    value={time.value}
                                    className="hover:bg-slate-50 transition-colors"
                                  >
                                    {time.display}
                                  </SelectItem>
                                </HoverCardTrigger>
                                {startTime && (
                                  <HoverCardContent className="w-auto p-2">
                                    <p className="text-xs">
                                      Duration: {calculateHoursWorked(startTime, time.value).toFixed(2)} hours
                                    </p>
                                  </HoverCardContent>
                                )}
                              </HoverCard>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  {form.formState.errors.endTime && (
                    <p className="text-sm text-red-500">{form.formState.errors.endTime.message}</p>
                  )}
                </div>
              </div>
            </div>
            
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
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about the work performed..."
                {...form.register('notes')}
                rows={3}
              />
            </div>
            
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
                
                {confirmationData.employeeId && employees.length > 0 && (
                  <>
                    <div className="text-muted-foreground">Employee:</div>
                    <div className="font-medium">
                      {employees.find(e => e.employee_id === confirmationData.employeeId)?.name}
                    </div>
                  </>
                )}
                
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
              
              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={confirmSubmit} 
                  className="bg-[#0485ea] hover:bg-[#0375d1]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Submit Time Entry'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimeEntryForm;
