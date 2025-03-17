import { useState } from 'react';
import { Mail, Phone, Calendar, MessageSquare, X, ArrowLeft, Send, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/ui/status-badge';
import { Star } from '@/components/ui/star';
import { ChevronDown } from '@/components/ui/chevron-down';

interface Conversation {
  id: string;
  date: Date;
  subject?: string;
  message: string;
  type: 'email' | 'call' | 'meeting' | 'note';
  from: string;
}

interface Appointment {
  id: string;
  title: string;
  date: Date;
  duration: number; // in minutes
  location?: string;
  notes?: string;
  contactId: string;
}

interface ContactDetailProps {
  contact: any;
  onClose: () => void;
  onStatusChange?: (contact: any, newStatus: string) => void;
}

const ContactDetail = ({ contact, onClose, onStatusChange }: ContactDetailProps) => {
  const [activeTab, setActiveTab] = useState('conversations');
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      date: new Date('2024-06-12T14:30:00'),
      subject: 'Project Requirements',
      message: 'Discussed the requirements for the new commercial building project. Client is interested in sustainable materials.',
      type: 'meeting',
      from: 'You'
    },
    {
      id: '2',
      date: new Date('2024-06-10T09:15:00'),
      subject: 'Initial Contact',
      message: 'Called to introduce our services and schedule an initial consultation.',
      type: 'call',
      from: 'You'
    }
  ]);
  
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      title: 'Project Review Meeting',
      date: new Date('2024-06-20T13:00:00'),
      duration: 60,
      location: 'Client Office',
      notes: 'Bring latest project drawings',
      contactId: contact.id
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [newAppointment, setNewAppointment] = useState<Partial<Appointment>>({
    title: '',
    date: new Date(),
    duration: 60,
    contactId: contact.id
  });
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  
  const handleSendEmail = () => {
    if (!newMessage.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message before sending",
        variant: "destructive"
      });
      return;
    }
    
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      date: new Date(),
      subject: 'New Message',
      message: newMessage,
      type: 'email',
      from: 'You'
    };
    
    setConversations([newConversation, ...conversations]);
    setNewMessage('');
    
    toast({
      title: "Email Sent",
      description: "Your message has been sent successfully",
    });
  };
  
  const handleCreateAppointment = () => {
    if (!newAppointment.title || !newAppointment.date) {
      toast({
        title: "Missing Information",
        description: "Please enter a title and date for the appointment",
        variant: "destructive"
      });
      return;
    }
    
    const appointment: Appointment = {
      id: `apt-${Date.now()}`,
      title: newAppointment.title || '',
      date: newAppointment.date || new Date(),
      duration: newAppointment.duration || 60,
      location: newAppointment.location,
      notes: newAppointment.notes,
      contactId: contact.id
    };
    
    setAppointments([appointment, ...appointments]);
    setShowAppointmentForm(false);
    setNewAppointment({
      title: '',
      date: new Date(),
      duration: 60,
      contactId: contact.id
    });
    
    toast({
      title: "Appointment Created",
      description: "The appointment has been added to your calendar",
    });
  };
  
  const getStatusOptions = () => {
    const type = contact.type;
    const currentStatus = contact.status;
    
    if (!currentStatus) return [];

    if (type === 'client' || type === 'customer') {
      switch (currentStatus) {
        case 'PROSPECT':
          return [{ value: 'ACTIVE', label: 'Convert to Active' }];
        case 'ACTIVE':
          return [{ value: 'INACTIVE', label: 'Mark as Inactive' }];
        case 'INACTIVE':
          return [{ value: 'ACTIVE', label: 'Reactivate' }];
        default:
          return [];
      }
    } else if (type === 'supplier') {
      switch (currentStatus) {
        case 'POTENTIAL':
          return [{ value: 'APPROVED', label: 'Approve Vendor' }];
        case 'APPROVED':
          return [{ value: 'INACTIVE', label: 'Mark as Inactive' }];
        case 'INACTIVE':
          return [{ value: 'APPROVED', label: 'Reactivate' }];
        default:
          return [];
      }
    } else if (type === 'subcontractor') {
      switch (currentStatus) {
        case 'PENDING':
          return [{ value: 'QUALIFIED', label: 'Mark as Qualified' }];
        case 'QUALIFIED':
          return [{ value: 'ACTIVE', label: 'Convert to Active' }];
        case 'ACTIVE':
          return [{ value: 'INACTIVE', label: 'Mark as Inactive' }];
        case 'INACTIVE':
          return [{ value: 'ACTIVE', label: 'Reactivate' }];
        default:
          return [];
      }
    } else if (type === 'employee') {
      switch (currentStatus) {
        case 'ACTIVE':
          return [{ value: 'INACTIVE', label: 'Mark as Inactive' }];
        case 'INACTIVE':
          return [{ value: 'ACTIVE', label: 'Reactivate' }];
        default:
          return [];
      }
    }
    
    return [];
  };
  
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onClose} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-medium">{contact.name}</h2>
            <p className="text-sm text-muted-foreground">{contact.company}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="border-b">
        <div className="flex p-4 gap-3">
          <Button size="sm" className="bg-[#0485ea] hover:bg-[#0375d1]">
            <Mail className="mr-1 h-4 w-4" />
            Email
          </Button>
          <Button size="sm" variant="outline">
            <Phone className="mr-1 h-4 w-4" />
            Call
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              setActiveTab('schedule');
              setShowAppointmentForm(true);
            }}
          >
            <Calendar className="mr-1 h-4 w-4" />
            Schedule
          </Button>
          
          {contact.status && getStatusOptions().length > 0 && onStatusChange && (
            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline">
                    Status: <StatusBadge className="ml-2" status={contact.status.toLowerCase() as any} size="sm" />
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {getStatusOptions().map((option) => (
                    <DropdownMenuItem 
                      key={option.value}
                      onClick={() => {
                        if (onStatusChange) {
                          onStatusChange(contact, option.value);
                        }
                      }}
                    >
                      <div className="flex items-center">
                        <StatusBadge status={option.value.toLowerCase() as any} size="sm" />
                        <span className="ml-2">{option.label}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
      
      <Tabs 
        defaultValue="conversations" 
        className="flex-1 flex flex-col overflow-hidden"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <div className="px-2 border-b">
          <TabsList className="w-full flex justify-start">
            <TabsTrigger value="conversations" className="flex-1">
              <MessageSquare className="mr-1 h-4 w-4" />
              Conversations
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex-1">
              <Calendar className="mr-1 h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="details" className="flex-1">
              Details
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="conversations" className="flex-1 flex flex-col p-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {conversations.map((conversation) => (
                <div key={conversation.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium">{conversation.from}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {format(conversation.date, 'PPp')}
                      </span>
                    </div>
                    <div className="rounded-full bg-[#0485ea]/10 px-2 py-1 text-xs text-[#0485ea]">
                      {conversation.type}
                    </div>
                  </div>
                  {conversation.subject && (
                    <h4 className="font-medium mb-1">{conversation.subject}</h4>
                  )}
                  <p className="text-sm">{conversation.message}</p>
                </div>
              ))}
              
              {conversations.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium mb-1">No conversations yet</h3>
                  <p className="text-muted-foreground mb-4">Start a conversation by sending an email or making a call</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-4 border-t">
            <div className="flex flex-col gap-4">
              <Textarea 
                placeholder="Write a message..." 
                className="resize-none"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <div className="flex justify-between">
                <Button variant="outline" size="icon">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button onClick={handleSendEmail} className="bg-[#0485ea] hover:bg-[#0375d1]">
                  <Send className="mr-1 h-4 w-4" />
                  Send Email
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="schedule" className="flex-1 overflow-y-auto p-4">
          {showAppointmentForm ? (
            <div className="border rounded-lg p-4 mb-4">
              <h3 className="font-medium mb-3">New Appointment</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Title</label>
                  <Input 
                    value={newAppointment.title || ''} 
                    onChange={(e) => setNewAppointment({...newAppointment, title: e.target.value})}
                    placeholder="Meeting title"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Date & Time</label>
                  <div className="flex gap-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {newAppointment.date ? format(newAppointment.date, 'PP') : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={newAppointment.date}
                          onSelect={(date) => date && setNewAppointment({...newAppointment, date})}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    
                    <Input 
                      type="time"
                      value={newAppointment.date ? format(newAppointment.date, 'HH:mm') : '09:00'}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':');
                        const newDate = new Date(newAppointment.date || new Date());
                        newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
                        setNewAppointment({...newAppointment, date: newDate});
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Duration (minutes)</label>
                  <Input 
                    type="number" 
                    value={newAppointment.duration || 60} 
                    onChange={(e) => setNewAppointment({...newAppointment, duration: parseInt(e.target.value, 10)})}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Location (optional)</label>
                  <Input 
                    value={newAppointment.location || ''} 
                    onChange={(e) => setNewAppointment({...newAppointment, location: e.target.value})}
                    placeholder="Meeting location"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Notes (optional)</label>
                  <Textarea 
                    value={newAppointment.notes || ''} 
                    onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                    placeholder="Additional details"
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAppointmentForm(false);
                      setNewAppointment({
                        title: '',
                        date: new Date(),
                        duration: 60,
                        contactId: contact.id
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAppointment} className="bg-[#0485ea] hover:bg-[#0375d1]">
                    Create Appointment
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button 
              onClick={() => setShowAppointmentForm(true)}
              className="mb-4 bg-[#0485ea] hover:bg-[#0375d1]"
            >
              <Calendar className="mr-1 h-4 w-4" />
              New Appointment
            </Button>
          )}
          
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{appointment.title}</h4>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{format(appointment.date, 'PPp')}</span>
                    <span className="mx-2">•</span>
                    <span>{appointment.duration} minutes</span>
                  </div>
                  {appointment.location && (
                    <div className="flex items-center text-sm">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="ml-1">{appointment.location}</span>
                    </div>
                  )}
                  {appointment.notes && (
                    <div className="text-sm mt-2">
                      <span className="text-muted-foreground">Notes:</span>
                      <p>{appointment.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {appointments.length === 0 && !showAppointmentForm && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium mb-1">No appointments scheduled</h3>
                <p className="text-muted-foreground mb-4">Schedule your first appointment with this contact</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="details" className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                  <a href={`mailto:${contact.email}`} className="text-[#0485ea] hover:underline">{contact.email}</a>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                  <a href={`tel:${contact.phone}`} className="hover:text-[#0485ea]">{contact.phone}</a>
                </div>
                <div className="flex items-start">
                  <Mail className="h-4 w-4 mr-3 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground">{contact.address}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Company Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-muted-foreground w-24">Company:</span>
                  <span>{contact.company}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-muted-foreground w-24">Role:</span>
                  <span>{contact.role}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-muted-foreground w-24">Type:</span>
                  <span className="capitalize">{contact.type}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-muted-foreground w-24">Status:</span>
                  {contact.status ? (
                    <StatusBadge status={contact.status.toLowerCase() as any} />
                  ) : (
                    <span>Not set</span>
                  )}
                </div>
                {contact.rating && (
                  <div className="flex items-center">
                    <span className="text-muted-foreground w-24">Rating:</span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < contact.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Additional Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-muted-foreground w-24">Last Contact:</span>
                  <span>{format(new Date(contact.lastContact), 'PP')}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-muted-foreground w-24">ID:</span>
                  <span className="text-muted-foreground">{contact.id}</span>
                </div>
                {contact.notes && (
                  <div className="flex flex-col">
                    <span className="text-muted-foreground mb-1">Notes:</span>
                    <p className="bg-muted p-3 rounded-md text-sm">{contact.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContactDetail;
