import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { googleCalendarService } from '@/services/googleCalendarService';
import { EventAttendee, EntityType, AssigneeType, CalendarSettings } from '@/types/unifiedCalendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import AttendeeSelector from './AttendeeSelector';
import { supabase } from '@/integrations/supabase/client';

// Types specific to the calendar form
export interface CalendarFormData {
  title: string;
  description: string;
  startDate: Date | null;
  endDate: Date | null;
  isAllDay: boolean;
  location: string;
  attendees: EventAttendee[];
  notifyExternalAttendees: boolean;
  syncEnabled: boolean;
  entityType: EntityType;
  entityId: string;
  calendarId?: string;
  extendedProperties?: Record<string, string>;
}

interface UnifiedCalendarFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: CalendarFormData;
  onSave: (data: CalendarFormData) => Promise<boolean>;
  onCancel: () => void;
  title?: string;
  description?: string;
  entityType: EntityType;
  entityId: string;
  showAttendees?: boolean;
}

const UnifiedCalendarForm = ({
  open,
  onOpenChange,
  initialData,
  onSave,
  onCancel,
  title = 'Calendar Event',
  description = 'Schedule and manage calendar events.',
  entityType,
  entityId,
  showAttendees = true,
}: UnifiedCalendarFormProps) => {
  const [formData, setFormData] = useState<CalendarFormData>({
    ...initialData,
    startDate: initialData.startDate || new Date(),
    endDate: initialData.endDate || new Date(),
    attendees: initialData.attendees || [],
    notifyExternalAttendees: initialData.notifyExternalAttendees ?? true,
    syncEnabled: initialData.syncEnabled ?? true,
  });
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendarSettings, setCalendarSettings] = useState<CalendarSettings | null>(null);
  const [activeTab, setActiveTab] = useState<string>('details');

  const { isAuthenticated } = useGoogleCalendar();
  const { toast } = useToast();

  // Load calendar settings for this entity type
  useEffect(() => {
    const loadCalendarSettings = async () => {
      try {
        const { data, error } = await supabase.rpc('get_calendar_settings', {
          p_entity_type: entityType,
        });

        if (error) throw error;

        if (data) {
          setCalendarSettings(data as CalendarSettings);

          // Update form data with calendar ID if not already set
          if (!formData.calendarId) {
            setFormData(prev => ({
              ...prev,
              calendarId: data.calendar_id,
              notifyExternalAttendees: data.notify_external_attendees,
            }));
          }
        }
      } catch (error) {
        console.error('Error loading calendar settings:', error);
      }
    };

    loadCalendarSettings();
  }, [entityType]);

  // Handle form field changes
  const handleInputChange = (field: keyof CalendarFormData, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!formData.title) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a title for the event.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.startDate) {
      toast({
        title: 'Missing Information',
        description: 'Please select a start date for the event.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await onSave(formData);

      if (success) {
        onOpenChange(false);
        toast({
          title: 'Success',
          description: 'Calendar event has been saved.',
        });
      }
    } catch (error) {
      console.error('Error saving calendar event:', error);
      toast({
        title: 'Error',
        description: 'Failed to save calendar event. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle attendee selection
  const handleAttendeeChange = (attendees: EventAttendee[]) => {
    setFormData({
      ...formData,
      attendees,
    });
  };

  // Check if there are any external attendees
  const hasExternalAttendees = formData.attendees.some(
    attendee =>
      attendee.type === 'subcontractor' ||
      attendee.type === 'vendor' ||
      attendee.type === 'customer'
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            {showAttendees && <TabsTrigger value="attendees">Attendees</TabsTrigger>}
          </TabsList>

          <TabsContent value="details" className="space-y-4 py-4">
            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => handleInputChange('title', e.target.value)}
                placeholder="Event title"
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="startDate"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.startDate && 'text-muted-foreground'
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.startDate ? (
                        format(formData.startDate, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={formData.startDate || undefined}
                      onSelect={date => {
                        handleInputChange('startDate', date);
                        setStartDateOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="endDate"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.endDate && 'text-muted-foreground'
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.endDate ? (
                        format(formData.endDate, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={formData.endDate || undefined}
                      onSelect={date => {
                        handleInputChange('endDate', date);
                        setEndDateOpen(false);
                      }}
                      initialFocus
                      disabled={date => date < (formData.startDate || new Date())}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* All Day Switch */}
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="isAllDay">All Day Event</Label>
              <Switch
                id="isAllDay"
                checked={formData.isAllDay}
                onCheckedChange={checked => handleInputChange('isAllDay', checked)}
              />
            </div>

            {/* Location */}
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={e => handleInputChange('location', e.target.value)}
                placeholder="Event location"
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                placeholder="Event description"
                rows={3}
              />
            </div>

            {/* Google Calendar Integration */}
            <div className="border p-4 rounded-md mt-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="syncEnabled" className="text-base font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    Google Calendar Integration
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add this event to{' '}
                    {calendarSettings?.calendar_id === 'primary'
                      ? 'your personal Google Calendar'
                      : 'the shared team calendar'}
                  </p>
                  {!isAuthenticated && (
                    <p className="text-xs text-amber-500 mt-1">Google Calendar not connected</p>
                  )}
                </div>
                <Switch
                  id="syncEnabled"
                  checked={formData.syncEnabled}
                  onCheckedChange={checked => handleInputChange('syncEnabled', checked)}
                  disabled={!isAuthenticated}
                />
              </div>
            </div>
          </TabsContent>

          {showAttendees && (
            <TabsContent value="attendees" className="space-y-4 py-4">
              <AttendeeSelector
                attendees={formData.attendees}
                onChange={handleAttendeeChange}
                entityType={entityType}
                entityId={entityId}
              />

              {/* External Notification Toggle */}
              {hasExternalAttendees && (
                <div className="border p-4 rounded-md mt-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label
                        htmlFor="notifyExternal"
                        className="text-base font-medium flex items-center"
                      >
                        Notify External Attendees
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Send calendar invitations to subcontractors, vendors and customers
                      </p>
                    </div>
                    <Switch
                      id="notifyExternal"
                      checked={formData.notifyExternalAttendees}
                      onCheckedChange={checked =>
                        handleInputChange('notifyExternalAttendees', checked)
                      }
                    />
                  </div>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.title || !formData.startDate}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedCalendarForm;
