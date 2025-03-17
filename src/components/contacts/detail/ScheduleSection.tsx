
import { Calendar, X } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';

export interface Appointment {
  id: string;
  title: string;
  date: Date;
  duration: number; // in minutes
  location?: string;
  notes?: string;
  contactId: string;
}

interface ScheduleSectionProps {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  contactId: string;
}

const ScheduleSection = ({ appointments, setAppointments, contactId }: ScheduleSectionProps) => {
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [newAppointment, setNewAppointment] = useState<Partial<Appointment>>({
    title: '',
    date: new Date(),
    duration: 60,
    contactId: contactId
  });
  
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
      contactId: contactId
    };
    
    setAppointments([appointment, ...appointments]);
    setShowAppointmentForm(false);
    setNewAppointment({
      title: '',
      date: new Date(),
      duration: 60,
      contactId: contactId
    });
    
    toast({
      title: "Appointment Created",
      description: "The appointment has been added to your calendar",
    });
  };
  
  return (
    <div className="flex-1 overflow-y-auto p-4">
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
                    contactId: contactId
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
    </div>
  );
};

export default ScheduleSection;
