import { useState, useEffect } from 'react';
import { Check, Plus, X, User, Users, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { EventAttendee, EntityType, AssigneeType } from '@/types/unifiedCalendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandEmpty,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface AttendeeData {
  id: string;
  name: string;
  email: string;
  type: AssigneeType;
  rate?: number;
}

interface AttendeeGroup {
  label: string;
  type: AssigneeType;
  items: AttendeeData[];
}

interface AttendeeSelectorProps {
  attendees: EventAttendee[];
  onChange: (attendees: EventAttendee[]) => void;
  entityType: EntityType;
  entityId: string;
  disabled?: boolean;
  maxAttendees?: number;
}

const AttendeeSelector = ({
  attendees,
  onChange,
  entityType,
  entityId,
  disabled = false,
  maxAttendees = 20,
}: AttendeeSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [attendeeGroups, setAttendeeGroups] = useState<AttendeeGroup[]>([]);
  const [selectedTab, setSelectedTab] = useState<AssigneeType>('employee');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch potential attendees on component mount
  useEffect(() => {
    const fetchAttendees = async () => {
      setIsLoading(true);
      try {
        // Fetch employees
        const { data: employees, error: employeesError } = await supabase
          .from('employees')
          .select('employee_id, first_name, last_name, email, hourly_rate, bill_rate')
          .eq('status', 'ACTIVE');

        if (employeesError) throw employeesError;

        // Fetch subcontractors
        const { data: subcontractors, error: subcontractorsError } = await supabase
          .from('subcontractors')
          .select('subcontractor_id, company_name, contact_name, email, hourly_rate');

        if (subcontractorsError) throw subcontractorsError;

        // Fetch vendors
        const { data: vendors, error: vendorsError } = await supabase
          .from('vendors')
          .select('vendor_id, company_name, contact_name, email');

        if (vendorsError) throw vendorsError;

        // Fetch customers/contacts
        const { data: contacts, error: contactsError } = await supabase
          .from('contacts')
          .select('contact_id, first_name, last_name, email');

        if (contactsError) throw contactsError;

        // Format each group
        const employeeItems: AttendeeData[] = (employees || []).map(emp => ({
          id: emp.employee_id,
          name: `${emp.first_name} ${emp.last_name}`,
          email: emp.email,
          type: 'employee' as AssigneeType,
          rate: emp.bill_rate || emp.hourly_rate,
        }));

        const subcontractorItems: AttendeeData[] = (subcontractors || []).map(sub => ({
          id: sub.subcontractor_id,
          name: sub.company_name || sub.contact_name,
          email: sub.email,
          type: 'subcontractor' as AssigneeType,
          rate: sub.hourly_rate,
        }));

        const vendorItems: AttendeeData[] = (vendors || []).map(vendor => ({
          id: vendor.vendor_id,
          name: vendor.company_name || vendor.contact_name,
          email: vendor.email,
          type: 'vendor' as AssigneeType,
        }));

        const contactItems: AttendeeData[] = (contacts || []).map(contact => ({
          id: contact.contact_id,
          name: `${contact.first_name} ${contact.last_name}`,
          email: contact.email,
          type: 'contact' as AssigneeType,
        }));

        // Set attendee groups
        setAttendeeGroups([
          { label: 'Employees', type: 'employee', items: employeeItems },
          { label: 'Subcontractors', type: 'subcontractor', items: subcontractorItems },
          { label: 'Vendors', type: 'vendor', items: vendorItems },
          { label: 'Contacts', type: 'contact', items: contactItems },
        ]);
      } catch (error) {
        console.error('Error fetching attendees:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendees();
  }, []);

  // Add an attendee
  const handleAddAttendee = (attendee: AttendeeData) => {
    // Check if attendee is already added
    if (attendees.some(a => a.id === attendee.id && a.type === attendee.type)) {
      return;
    }

    // Check if we've reached the maximum number of attendees
    if (attendees.length >= maxAttendees) {
      return;
    }

    const newAttendee: EventAttendee = {
      id: attendee.id,
      type: attendee.type,
      name: attendee.name,
      email: attendee.email,
      rate: attendee.rate,
      response_status: 'needsAction',
    };

    onChange([...attendees, newAttendee]);
  };

  // Remove an attendee
  const handleRemoveAttendee = (attendeeId: string, attendeeType: AssigneeType) => {
    onChange(attendees.filter(a => !(a.id === attendeeId && a.type === attendeeType)));
  };

  // Filter attendees based on search query
  const filteredGroups = attendeeGroups.map(group => ({
    ...group,
    items: group.items.filter(
      item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.email && item.email.toLowerCase().includes(searchQuery.toLowerCase()))
    ),
  }));

  // Get current tab items
  const currentTabItems = filteredGroups.find(group => group.type === selectedTab)?.items || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-1.5">
        <Label>Attendees</Label>
        <div className="flex flex-wrap gap-2 min-h-[38px] p-2 border rounded-md">
          {attendees.length === 0 ? (
            <div className="text-sm text-muted-foreground">No attendees added</div>
          ) : (
            attendees.map(attendee => (
              <Badge
                key={`${attendee.type}-${attendee.id}`}
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1"
              >
                <div className="max-w-[150px] truncate">{attendee.name}</div>
                <button
                  type="button"
                  onClick={() => handleRemoveAttendee(attendee.id, attendee.type)}
                  className="text-muted-foreground hover:text-foreground ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          )}
        </div>
      </div>

      {attendees.length < maxAttendees && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start" disabled={disabled}>
              <Plus className="mr-2 h-4 w-4" />
              Add Attendee
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start" side="bottom" sideOffset={8}>
            <Tabs
              defaultValue="employee"
              value={selectedTab}
              onValueChange={value => setSelectedTab(value as AssigneeType)}
            >
              <div className="flex items-center p-4 border-b">
                <TabsList className="flex-1">
                  <TabsTrigger value="employee" className="flex-1">
                    Employees
                  </TabsTrigger>
                  <TabsTrigger value="subcontractor" className="flex-1">
                    Subcontractors
                  </TabsTrigger>
                  {entityType !== 'work_order' && (
                    <>
                      <TabsTrigger value="vendor" className="flex-1">
                        Vendors
                      </TabsTrigger>
                      <TabsTrigger value="contact" className="flex-1">
                        Contacts
                      </TabsTrigger>
                    </>
                  )}
                </TabsList>
              </div>

              <div className="p-2 border-b">
                <Input
                  placeholder="Search attendees..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="h-8"
                  prefix={<Search className="h-4 w-4 text-muted-foreground" />}
                />
              </div>

              <ScrollArea className="h-[300px]">
                {isLoading ? (
                  <div className="p-4 text-center text-muted-foreground">Loading attendees...</div>
                ) : (
                  <div>
                    {filteredGroups.map(group => (
                      <TabsContent key={group.type} value={group.type} className="mt-0">
                        {currentTabItems.length === 0 ? (
                          <div className="p-4 text-center text-muted-foreground">
                            No {group.label.toLowerCase()} found
                          </div>
                        ) : (
                          <Command>
                            <CommandList>
                              <CommandGroup>
                                {currentTabItems.map(item => {
                                  const isSelected = attendees.some(
                                    a => a.id === item.id && a.type === item.type
                                  );
                                  return (
                                    <CommandItem
                                      key={`${item.type}-${item.id}`}
                                      onSelect={() => {
                                        if (!isSelected) {
                                          handleAddAttendee(item);
                                        } else {
                                          handleRemoveAttendee(item.id, item.type);
                                        }
                                      }}
                                      className="flex items-center justify-between p-2"
                                    >
                                      <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                          <AvatarFallback className="bg-primary/10">
                                            {item.name.charAt(0).toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                          <span className="text-sm font-medium">{item.name}</span>
                                          {item.email && (
                                            <span className="text-xs text-muted-foreground">
                                              {item.email}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div
                                        className={cn(
                                          'h-5 w-5 flex items-center justify-center rounded-full',
                                          isSelected
                                            ? 'bg-primary text-primary-foreground'
                                            : 'border'
                                        )}
                                      >
                                        {isSelected && <Check className="h-3 w-3" />}
                                      </div>
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        )}
                      </TabsContent>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </Tabs>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default AttendeeSelector;
