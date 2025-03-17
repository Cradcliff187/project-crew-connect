
import { useState } from 'react';
import { Search, Users, Plus, Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageTransition from '@/components/layout/PageTransition';
import Header from '@/components/layout/Header';
import ContactCard from '@/components/contacts/ContactCard';
import ContactForm from '@/components/contacts/ContactForm';
import ContactDetail from '@/components/contacts/ContactDetail';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StatusType } from '@/types/common';

// Define the contact type based on our database schema
export type Contact = {
  id: string;
  name: string;
  company?: string;
  role?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  type: 'client' | 'customer' | 'supplier' | 'subcontractor' | 'employee';
  status?: StatusType | string;
  lastContact?: string;
  notes?: string;
  specialty?: string;
  hourlyRate?: string;
  materials?: string;
  rating?: number;
};

export type ContactFormData = {
  name: string;
  company?: string;
  role?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  type: 'client' | 'customer' | 'supplier' | 'subcontractor' | 'employee';
  status?: string;
  notes?: string;
  specialty?: string;
  hourlyRate?: string;
  materials?: string;
  rating?: number;
};

// Function to fetch contacts from Supabase
const fetchContacts = async (): Promise<Contact[]> => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching contacts: ${error.message}`);
  }

  // Transform the data to match our Contact type
  return data.map(item => ({
    id: item.id,
    name: item.name,
    company: item.company,
    role: item.role,
    email: item.email,
    phone: item.phone,
    address: item.address,
    city: item.city,
    state: item.state,
    zip: item.zip,
    type: item.contact_type as 'client' | 'customer' | 'supplier' | 'subcontractor' | 'employee',
    status: item.status?.toUpperCase(),
    lastContact: item.last_contact,
    notes: item.notes,
    specialty: item.specialty,
    hourlyRate: item.hourly_rate?.toString(),
    materials: item.materials,
    rating: item.rating
  }));
};

const Contacts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  // Use React Query to fetch and cache contacts
  const queryClient = useQueryClient();
  const { data: contacts = [], isLoading, error } = useQuery({
    queryKey: ['contacts'],
    queryFn: fetchContacts
  });
  
  // Mutation for adding a new contact
  const addContactMutation = useMutation({
    mutationFn: async (newContact: ContactFormData) => {
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          name: newContact.name,
          contact_type: newContact.type,
          company: newContact.company,
          role: newContact.role,
          email: newContact.email,
          phone: newContact.phone,
          address: newContact.address,
          city: newContact.city,
          state: newContact.state,
          zip: newContact.zip,
          status: newContact.status?.toLowerCase(),
          notes: newContact.notes,
          specialty: newContact.specialty,
          hourly_rate: newContact.hourlyRate ? parseFloat(newContact.hourlyRate.toString()) : null,
          materials: newContact.materials,
          rating: newContact.rating,
          last_contact: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: "Contact Added",
        description: "The contact has been added successfully."
      });
      setShowForm(false);
    },
    onError: (error) => {
      console.error("Error adding contact:", error);
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Mutation for updating a contact
  const updateContactMutation = useMutation({
    mutationFn: async (updatedContact: Contact) => {
      const { data, error } = await supabase
        .from('contacts')
        .update({
          name: updatedContact.name,
          contact_type: updatedContact.type,
          company: updatedContact.company,
          role: updatedContact.role,
          email: updatedContact.email,
          phone: updatedContact.phone,
          address: updatedContact.address,
          city: updatedContact.city,
          state: updatedContact.state,
          zip: updatedContact.zip,
          status: updatedContact.status?.toLowerCase(),
          notes: updatedContact.notes,
          specialty: updatedContact.specialty,
          hourly_rate: updatedContact.hourlyRate ? parseFloat(updatedContact.hourlyRate.toString()) : null,
          materials: updatedContact.materials,
          rating: updatedContact.rating,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedContact.id)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: "Contact Updated",
        description: "The contact has been updated successfully."
      });
      setEditingContact(null);
    },
    onError: (error) => {
      console.error("Error updating contact:", error);
      toast({
        title: "Error",
        description: "Failed to update contact. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Mutation for deleting a contact
  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: "Contact Deleted",
        description: "The contact has been removed."
      });
    },
    onError: (error) => {
      console.error("Error deleting contact:", error);
      toast({
        title: "Error",
        description: "Failed to delete contact. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Mutation for updating status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ contactId, newStatus }: { contactId: string; newStatus: string }) => {
      const { data, error } = await supabase
        .from('contacts')
        .update({
          status: newStatus.toLowerCase(),
          updated_at: new Date().toISOString()
        })
        .eq('id', contactId)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: "Status Updated",
        description: "The contact's status has been updated."
      });
    },
    onError: (error) => {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Filter contacts based on search query and active tab
  const filteredContacts = contacts
    .filter(contact => 
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.company && contact.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (contact.specialty && contact.specialty.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter(contact => activeTab === 'all' || contact.type === activeTab);
  
  // Function to handle adding a new contact
  const handleAddContact = (data: ContactFormData) => {
    addContactMutation.mutate(data);
  };
  
  // Function to handle editing a contact
  const handleEditContact = (data: Contact) => {
    updateContactMutation.mutate(data);
  };
  
  // Function to handle deleting a contact
  const handleDeleteContact = (contact: Contact) => {
    deleteContactMutation.mutate(contact.id);
  };

  // Function to handle contact status transitions
  const handleStatusChange = (contact: Contact, newStatus: string) => {
    updateStatusMutation.mutate({ contactId: contact.id, newStatus });
  };
  
  // Show error message if fetching contacts fails
  if (error) {
    toast({
      title: "Error Loading Contacts",
      description: "There was an error loading contacts. Please refresh the page.",
      variant: "destructive"
    });
  }
  
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <div className="flex flex-col gap-2 mb-6 animate-in">
            <h1 className="text-3xl font-semibold tracking-tight">Contacts</h1>
            <p className="text-muted-foreground">
              Manage your clients, customers, suppliers, subcontractors, and employees
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 animate-in" style={{ animationDelay: '0.1s' }}>
            <div className="relative w-full md:w-auto flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search contacts..." 
                className="pl-9 subtle-input rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4 mr-1" />
                Filter
                <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
              </Button>
              <Button 
                size="sm" 
                className="flex-1 md:flex-auto bg-[#0485ea] hover:bg-[#0375d1]"
                onClick={() => setShowForm(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Contact
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="animate-in" style={{ animationDelay: '0.15s' }} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all" className="px-4">All Contacts</TabsTrigger>
              <TabsTrigger value="client" className="px-4">Clients</TabsTrigger>
              <TabsTrigger value="customer" className="px-4">Customers</TabsTrigger>
              <TabsTrigger value="supplier" className="px-4">Suppliers</TabsTrigger>
              <TabsTrigger value="subcontractor" className="px-4">Subcontractors</TabsTrigger>
              <TabsTrigger value="employee" className="px-4">Employees</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6 animate-in" style={{ animationDelay: '0.2s' }}>
            {isLoading ? (
              // Show loading state
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="premium-card h-[250px] animate-pulse">
                  <div className="p-5 space-y-4">
                    <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                  <div className="px-5 py-3 bg-gray-50 border-t"></div>
                </div>
              ))
            ) : filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <ContactCard 
                  key={contact.id} 
                  contact={contact} 
                  onView={(contact) => setSelectedContact(contact)}
                  onEdit={(contact) => setEditingContact(contact)}
                  onDelete={handleDeleteContact}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center p-10 text-center">
                <Users className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium mb-1">No contacts found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
                <Button 
                  className="bg-[#0485ea] hover:bg-[#0375d1]"
                  onClick={() => setShowForm(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Your First Contact
                </Button>
              </div>
            )}
          </div>
        </main>
        
        {showForm && (
          <ContactForm 
            onSubmit={handleAddContact} 
            onCancel={() => setShowForm(false)} 
          />
        )}
        
        {editingContact && (
          <ContactForm 
            initialData={editingContact}
            onSubmit={handleEditContact} 
            onCancel={() => setEditingContact(null)} 
          />
        )}
        
        {selectedContact && (
          <ContactDetail 
            contact={selectedContact} 
            onClose={() => setSelectedContact(null)} 
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default Contacts;
