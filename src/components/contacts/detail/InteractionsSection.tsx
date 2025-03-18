
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Plus, 
  Calendar, 
  Clock, 
  MessageCircle, 
  Mail, 
  Phone, 
  File, 
  Check, 
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ContactInteraction,
  fetchContactInteractions,
  addContactInteraction,
  getInteractionTypeOptions,
  getInteractionStatusOptions
} from './util/contactInteractions';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Contact } from '@/pages/Contacts';

const formSchema = z.object({
  interaction_type: z.string({
    required_error: "Please select an interaction type",
  }),
  subject: z.string().min(1, "Subject is required"),
  notes: z.string().optional(),
  interaction_date: z.date({
    required_error: "Date is required",
  }),
  status: z.string({
    required_error: "Status is required",
  }),
  scheduled_date: z.date().optional(),
  scheduled_time: z.string().optional(),
  duration_minutes: z.number().optional(),
});

interface InteractionsSectionProps {
  contact: Contact;
  onInteractionAdded?: () => void;
}

const InteractionsSection = ({ contact, onInteractionAdded }: InteractionsSectionProps) => {
  const [interactions, setInteractions] = useState<ContactInteraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [interactionType, setInteractionType] = useState('NOTE');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      interaction_type: 'NOTE',
      subject: '',
      notes: '',
      interaction_date: new Date(),
      status: 'COMPLETED',
      scheduled_date: undefined,
      scheduled_time: '',
      duration_minutes: 0,
    },
  });

  useEffect(() => {
    const loadInteractions = async () => {
      setLoading(true);
      try {
        const data = await fetchContactInteractions(contact.id);
        setInteractions(data);
      } catch (error) {
        console.error("Error loading interactions:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadInteractions();
  }, [contact.id, refreshTrigger]);

  useEffect(() => {
    // Set default status when interaction type changes
    const newType = form.getValues('interaction_type');
    if (newType) {
      setInteractionType(newType);
      form.setValue('status', newType === 'TASK' ? 'PLANNED' : 'COMPLETED');
    }
  }, [form.watch('interaction_type')]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const newInteraction = {
        contact_id: contact.id,
        interaction_type: values.interaction_type,
        subject: values.subject,
        notes: values.notes,
        interaction_date: values.interaction_date.toISOString(),
        scheduled_date: values.scheduled_date ? values.scheduled_date.toISOString() : undefined,
        scheduled_time: values.scheduled_time,
        duration_minutes: values.duration_minutes,
        status: values.status,
        created_by: 'System'
      };
      
      await addContactInteraction(newInteraction);
      setShowAddDialog(false);
      form.reset();
      setRefreshTrigger(prev => prev + 1);
      
      if (onInteractionAdded) {
        onInteractionAdded();
      }
    } catch (error) {
      console.error("Error adding interaction:", error);
    }
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'CALL': return <Phone className="h-4 w-4" />;
      case 'EMAIL': return <Mail className="h-4 w-4" />;
      case 'MEETING': return <Calendar className="h-4 w-4" />;
      case 'NOTE': return <File className="h-4 w-4" />;
      case 'TASK': return <Check className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
      case 'PLANNED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Interactions & Communications</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            size="sm" 
            variant="default" 
            className="bg-[#0485ea] hover:bg-[#0375d1]"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Interaction
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {interactions.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-center text-muted-foreground">
            No interactions recorded for this contact yet.
          </div>
        ) : (
          <div className="space-y-3">
            {interactions.map(interaction => (
              <div key={interaction.id} className="flex gap-3 p-3 border rounded-md hover:bg-gray-50 transition-colors">
                <div className="mt-1">
                  <div className="p-2 bg-gray-100 rounded-full">
                    {getInteractionIcon(interaction.interaction_type)}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2 gap-1">
                    <h4 className="font-medium">{interaction.subject}</h4>
                    <div className="flex gap-2 items-center text-sm text-muted-foreground">
                      <span>{format(new Date(interaction.interaction_date), 'PP')}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(interaction.status)}`}>
                        {interaction.status}
                      </span>
                    </div>
                  </div>
                  {interaction.notes && <p className="text-sm">{interaction.notes}</p>}
                  
                  {interaction.scheduled_date && (
                    <div className="flex items-center mt-2 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      <span>
                        Scheduled: {format(new Date(interaction.scheduled_date), 'PP')}
                        {interaction.scheduled_time && ` at ${interaction.scheduled_time}`}
                        {interaction.duration_minutes && ` (${interaction.duration_minutes} minutes)`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Interaction</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="interaction_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interaction Type</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setInteractionType(value);
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getInteractionTypeOptions().map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter subject" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="interaction_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getInteractionStatusOptions(interactionType).map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {(interactionType === 'MEETING' || interactionType === 'TASK') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="scheduled_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Scheduled Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="scheduled_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 3:00 PM" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="duration_minutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (min)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="60" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any additional details about this interaction" 
                        className="resize-none h-20"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#0485ea] hover:bg-[#0375d1]"
                >
                  Add Interaction
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InteractionsSection;
