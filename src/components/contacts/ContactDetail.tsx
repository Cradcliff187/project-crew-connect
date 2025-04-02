
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Calendar, 
  ClipboardList, 
  Users, 
  BarChart4,
  Info
} from 'lucide-react';

// Import refactored components
import ContactDetailHeader from './detail/ContactDetailHeader';
import ContactActionButtons from './detail/ContactActionButtons';
import ConversationSection, { Conversation } from './detail/ConversationSection';
import ScheduleSection, { Appointment } from './detail/ScheduleSection';
import ContactDetailInformation from './detail/ContactDetailInformation';
import RelationshipsSection from './detail/RelationshipsSection';
import InteractionsSection from './detail/InteractionsSection';
import PerformanceSection from './detail/PerformanceSection';

import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { updateContactStatus } from './detail/util/contactTransitions';
import { useQueryClient } from '@tanstack/react-query';

interface ContactDetailProps {
  contact: any;
  onClose: () => void;
  onStatusChange?: (contact: any, newStatus: string) => void;
}

const ContactDetail = ({ contact, onClose, onStatusChange }: ContactDetailProps) => {
  const [activeTab, setActiveTab] = useState('interactions');
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

  const queryClient = useQueryClient();
  
  // Handle status changes from any component
  const handleStatusChange = async (newStatus: string) => {
    const success = await updateContactStatus(contact.id, newStatus);
    
    if (success) {
      // Update contact locally
      contact.status = newStatus;
      
      // Notify parent component
      if (onStatusChange) {
        onStatusChange(contact, newStatus);
      }
      
      // Refresh contacts data
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      
      toast({
        title: "Status Updated",
        description: `Contact status has been updated to ${newStatus}.`
      });
    }
  };

  const handleInteractionAdded = () => {
    // Refresh the contact data
    queryClient.invalidateQueries({ queryKey: ['contacts'] });
  };

  // This wrapper function adapts the handleStatusChange to match the expected signature
  // It will be passed to components that need the function but don't use the parameter
  const handleStatusChangeWrapper = () => {
    console.log("Status change wrapper called");
    // The actual status change is handled by components that will pass the new status
  };
  
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col overflow-hidden">
      <ContactDetailHeader 
        name={contact.name} 
        company={contact.company} 
        onClose={onClose} 
      />
      
      <ContactActionButtons 
        contact={contact} 
        onStatusChange={handleStatusChange} 
        onSchedule={() => {
          setActiveTab('schedule');
        }} 
      />
      
      <Tabs 
        defaultValue="interactions" 
        className="flex-1 flex flex-col overflow-hidden"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <div className="px-2 border-b">
          <TabsList className="w-full flex justify-start">
            <TabsTrigger value="interactions" className="flex-1">
              <MessageSquare className="mr-1 h-4 w-4" />
              Interactions
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex-1">
              <Calendar className="mr-1 h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="relationships" className="flex-1 hidden md:flex">
              <Users className="mr-1 h-4 w-4" />
              Relationships
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex-1 hidden md:flex">
              <BarChart4 className="mr-1 h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="details" className="flex-1">
              <Info className="mr-1 h-4 w-4" />
              Details
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="interactions" className="flex-1 overflow-y-auto p-4">
          <InteractionsSection 
            contact={contact}
            onInteractionAdded={handleInteractionAdded}
          />
        </TabsContent>
        
        <TabsContent value="schedule" className="flex-1 overflow-y-auto p-4">
          <ScheduleSection 
            appointments={appointments} 
            setAppointments={setAppointments} 
            contactId={contact.id} 
          />
        </TabsContent>
        
        <TabsContent value="relationships" className="flex-1 overflow-y-auto p-4">
          <RelationshipsSection contact={contact} />
        </TabsContent>
        
        <TabsContent value="performance" className="flex-1 overflow-y-auto p-4">
          <PerformanceSection 
            contact={contact}
            onMetricAdded={() => queryClient.invalidateQueries({ queryKey: ['contacts'] })}
          />
        </TabsContent>
        
        <TabsContent value="details" className="flex-1 overflow-y-auto p-4">
          <ContactDetailInformation 
            contact={contact} 
            onStatusChange={handleStatusChangeWrapper}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContactDetail;
