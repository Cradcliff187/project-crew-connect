
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Calendar } from 'lucide-react';

// Import refactored components
import ContactDetailHeader from './detail/ContactDetailHeader';
import ContactActionButtons from './detail/ContactActionButtons';
import ConversationSection, { Conversation } from './detail/ConversationSection';
import ScheduleSection, { Appointment } from './detail/ScheduleSection';
import ContactInfoSection from './detail/ContactInfoSection';

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
  
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col overflow-hidden">
      <ContactDetailHeader 
        name={contact.name} 
        company={contact.company} 
        onClose={onClose} 
      />
      
      <ContactActionButtons 
        contact={contact} 
        onStatusChange={onStatusChange} 
        onSchedule={() => {
          setActiveTab('schedule');
        }} 
      />
      
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
          <ConversationSection 
            conversations={conversations} 
            setConversations={setConversations} 
          />
        </TabsContent>
        
        <TabsContent value="schedule" className="flex-1 overflow-y-auto p-0">
          <ScheduleSection 
            appointments={appointments} 
            setAppointments={setAppointments} 
            contactId={contact.id} 
          />
        </TabsContent>
        
        <TabsContent value="details" className="flex-1 overflow-y-auto p-4">
          <ContactInfoSection contact={contact} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContactDetail;
