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
  RefreshCw,
  CalendarPlus,
  Info,
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
  getInteractionStatusOptions,
} from './util/contactInteractions';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Contact } from '@/pages/Contacts';
import { Switch } from '@/components/ui/switch';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { toast } from '@/hooks/use-toast';
import { createCalendarEvent } from '@/services/calendarService';
import { CalendarIntegrationToggle } from '@/components/common/CalendarIntegrationToggle';

const formSchema = z.object({
  interaction_type: z.string({
    required_error: 'Please select an interaction type',
  }),
  subject: z.string().min(1, 'Subject is required'),
  notes: z.string().optional(),
  interaction_date: z.date({
    required_error: 'Date is required',
  }),
  status: z.string({
    required_error: 'Status is required',
  }),
  scheduled_date: z.date().optional(),
  scheduled_time: z.string().optional(),
  duration_minutes: z.number().optional(),
  sync_to_calendar: z.boolean().default(false),
  attendee_emails: z.string().optional(),
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
  const { isAuthenticated, login } = useGoogleCalendar();
  const [calendarSyncing, setCalendarSyncing] = useState(false);

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
      sync_to_calendar: false,
      attendee_emails: contact?.email || '',
    },
  });

  useEffect(() => {
    const loadInteractions = async () => {
      setLoading(true);
      try {
        const data = await fetchContactInteractions(contact.id);
        setInteractions(data);
      } catch (error) {
        console.error('Error loading interactions:', error);
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

      // Only suggest calendar sync for meetings by default
      form.setValue('sync_to_calendar', newType === 'MEETING');
    }
  }, [form.watch('interaction_type')]);

  // Add attendee email when contact changes or when initially loaded
  useEffect(() => {
    if (contact?.email) {
      form.setValue('attendee_emails', contact.email);
    }
  }, [contact, form]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      let calendarEventId = null;

      // Create calendar event if needed
      if (
        values.sync_to_calendar &&
        values.scheduled_date &&
        (values.interaction_type === 'MEETING' || values.interaction_type === 'TASK')
      ) {
        if (!isAuthenticated) {
          const confirmed = window.confirm(
            'You need to connect your Google Calendar first. Would you like to do that now?'
          );
          if (confirmed) {
            await login();
            toast({
              title: 'Authentication required',
              description: 'Please try again after connecting to Google Calendar',
            });
            return;
          } else {
            // Proceed without calendar sync
            form.setValue('sync_to_calendar', false);
          }
        } else {
          setCalendarSyncing(true);

          // Parse time string
          let hours = 9,
            minutes = 0;
          if (values.scheduled_time) {
            const timeParts = values.scheduled_time.split(':');
            if (timeParts.length === 2) {
              hours = parseInt(timeParts[0], 10);
              minutes = parseInt(timeParts[1], 10);
            }
          }

          // Set start date with time
          const startDate = new Date(values.scheduled_date);
          startDate.setHours(hours, minutes, 0, 0);

          // Calculate end date based on duration
          const endDate = new Date(startDate);
          endDate.setMinutes(endDate.getMinutes() + (values.duration_minutes || 60));

          // Prepare attendees if any
          const attendees = [];
          if (values.attendee_emails) {
            attendees.push(...values.attendee_emails.split(',').map(email => email.trim()));
          }

          try {
            const calendarEvent = await createCalendarEvent({
              title: values.subject,
              description: values.notes || `Meeting with ${contact.name}`,
              startTime: startDate.toISOString(),
              endTime: endDate.toISOString(),
              location: '',
              entityType: 'contact_interaction',
              entityId: contact.id,
              attendees,
              sendNotifications: true,
            });

            calendarEventId = calendarEvent.id;

            toast({
              title: 'Calendar event created',
              description: 'The meeting has been added to your Google Calendar',
            });
          } catch (error) {
            console.error('Failed to create calendar event:', error);
            toast({
              title: 'Calendar sync failed',
              description: 'Unable to create Google Calendar event',
              variant: 'destructive',
            });
          } finally {
            setCalendarSyncing(false);
          }
        }
      }

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
        created_by: 'System',
        calendar_event_id: calendarEventId,
        calendar_sync_enabled: values.sync_to_calendar,
      };

      await addContactInteraction(newInteraction);
      setShowAddDialog(false);
      form.reset();
      setRefreshTrigger(prev => prev + 1);

      if (onInteractionAdded) {
        onInteractionAdded();
      }
    } catch (error) {
      console.error('Error adding interaction:', error);
    }
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'CALL':
        return <Phone className="h-4 w-4" />;
      case 'EMAIL':
        return <Mail className="h-4 w-4" />;
      case 'MEETING':
        return <Calendar className="h-4 w-4" />;
      case 'NOTE':
        return <File className="h-4 w-4" />;
      case 'TASK':
        return <Check className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
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

  const createCalendarEventForInteraction = async (interaction: ContactInteraction) => {
    if (!isAuthenticated) {
      const confirmed = window.confirm(
        'You need to connect your Google Calendar first. Would you like to do that now?'
      );
      if (confirmed) {
        await login();
        toast({
          title: 'Authentication required',
          description: 'Please try again after connecting to Google Calendar',
        });
        return;
      } else {
        return;
      }
    }

    if (!interaction.scheduled_date) {
      toast({
        title: 'Missing scheduled date',
        description: 'This interaction needs a scheduled date before adding to calendar',
        variant: 'destructive',
      });
      return;
    }

    setCalendarSyncing(true);
    try {
      // Parse time string
      let hours = 9,
        minutes = 0;
      if (interaction.scheduled_time) {
        const timeParts = interaction.scheduled_time.split(':');
        if (timeParts.length === 2) {
          hours = parseInt(timeParts[0], 10);
          minutes = parseInt(timeParts[1], 10);
        }
      }

      // Set start date with time
      const startDate = new Date(interaction.scheduled_date);
      startDate.setHours(hours, minutes, 0, 0);

      // Calculate end date based on duration
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + (interaction.duration_minutes || 60));

      // Prepare attendees if any
      const attendees = [];
      if (contact.email) {
        attendees.push(contact.email);
      }

      const calendarEvent = await createCalendarEvent({
        title: interaction.subject,
        description: interaction.notes || `Meeting with ${contact.name}`,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        location: '',
        entityType: 'contact_interaction',
        entityId: contact.id,
        attendees,
        sendNotifications: true,
      });

      // Update the interaction with the calendar event ID
      // This would require an additional API endpoint to update the interaction
      // For now just show a success message
      toast({
        title: 'Calendar event created',
        description: 'The interaction has been added to your Google Calendar',
      });

      // Refresh the list to show the updated status
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to create calendar event:', error);
      toast({
        title: 'Calendar sync failed',
        description: 'Unable to create Google Calendar event',
        variant: 'destructive',
      });
    } finally {
      setCalendarSyncing(false);
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
              <div
                key={interaction.id}
                className="flex gap-3 p-3 border rounded-md hover:bg-gray-50 transition-colors"
              >
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
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(interaction.status)}`}
                      >
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
                        {interaction.duration_minutes &&
                          ` (${interaction.duration_minutes} minutes)`}
                      </span>
                    </div>
                  )}

                  {interaction.scheduled_date &&
                    !interaction.calendar_event_id &&
                    (interaction.interaction_type === 'MEETING' ||
                      interaction.interaction_type === 'TASK') && (
                      <div className="mt-2">
                        <Button
                          variant={isAuthenticated ? 'outline' : 'secondary'}
                          size="sm"
                          className="text-xs"
                          onClick={() => createCalendarEventForInteraction(interaction)}
                          disabled={calendarSyncing || !isAuthenticated}
                        >
                          {isAuthenticated ? (
                            <>
                              <CalendarPlus className="h-3 w-3 mr-1" />
                              Add to Calendar
                            </>
                          ) : (
                            <>
                              <Calendar className="h-3 w-3 mr-1" />
                              <a href="/settings?tab=calendar" className="text-xs">
                                Connect Calendar
                              </a>
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                  {interaction.calendar_event_id && (
                    <div className="flex items-center mt-2 text-xs text-green-600">
                      <Check className="h-3 w-3 mr-1" />
                      <span>Added to Google Calendar</span>
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
                      onValueChange={value => {
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
                              variant={'outline'}
                              className={cn(
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <>
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
                                  variant={'outline'}
                                  className={cn(
                                    'pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, 'PPP')
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
                              <Input type="time" placeholder="15:00" {...field} />
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
                                onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 border-t pt-4 mt-2">
                    <FormField
                      control={form.control}
                      name="sync_to_calendar"
                      render={({ field }) => (
                        <FormControl>
                          <CalendarIntegrationToggle
                            value={field.value}
                            onChange={field.onChange}
                            disabled={!form.watch('scheduled_date')}
                            disabledReason="A scheduled date is required for calendar integration"
                            description="Create a calendar event for this meeting"
                            entityType="contact_interaction"
                          />
                        </FormControl>
                      )}
                    />

                    {form.watch('sync_to_calendar') && (
                      <FormField
                        control={form.control}
                        name="attendee_emails"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Attendee Emails</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="email@example.com, email2@example.com"
                                {...field}
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground mt-1">
                              Separate multiple emails with commas
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {!isAuthenticated && form.watch('sync_to_calendar') && (
                      <div className="text-sm rounded-md bg-blue-50 p-3 text-blue-700 mt-2">
                        <p className="flex items-center">
                          <Info className="h-4 w-4 mr-2" />
                          You need to connect to Google Calendar first
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2 text-xs"
                          onClick={() => login()}
                        >
                          Connect to Google Calendar
                        </Button>
                      </div>
                    )}
                  </div>
                </>
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
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#0485ea] hover:bg-[#0375d1]"
                  disabled={calendarSyncing}
                >
                  {calendarSyncing ? 'Creating event...' : 'Add Interaction'}
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
