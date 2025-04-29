import { useState } from 'react';
import { Search, Users, Plus, Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageTransition from '@/components/layout/PageTransition';
import PageHeader from '@/components/layout/PageHeader';
import ContactCard from '@/components/contacts/ContactCard';
import ContactForm from '@/components/contacts/ContactForm';
import ContactDetail from '@/components/contacts/ContactDetail';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StatusType } from '@/types/common';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';

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
  type: 'client' | 'customer' | 'supplier' | 'subcontractor' | 'employee'; // Changed from contact_type
  status?: StatusType | string;
  lastContact?: string; // Changed from last_contact
  notes?: string;
  specialty?: string;
  hourlyRate?: string; // Changed from hourly_rate
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

const fetchContacts = async (): Promise<Contact[]> => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching contacts: ${error.message}`);
  }

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
    rating: item.rating,
  }));
};

const Contacts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<'add' | 'edit' | 'view'>('add');
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);

  const queryClient = useQueryClient();
  const {
    data: contacts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['contacts'],
    queryFn: fetchContacts,
  });

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
          last_contact: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: 'Contact Added',
        description: 'The contact has been added successfully.',
      });
      setIsSheetOpen(false);
    },
    onError: error => {
      console.error('Error adding contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to add contact. Please try again.',
        variant: 'destructive',
      });
    },
  });

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
          hourly_rate: updatedContact.hourlyRate
            ? parseFloat(updatedContact.hourlyRate.toString())
            : null,
          materials: updatedContact.materials,
          rating: updatedContact.rating,
          updated_at: new Date().toISOString(),
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
        title: 'Contact Updated',
        description: 'The contact has been updated successfully.',
      });
      setIsSheetOpen(false);
    },
    onError: error => {
      console.error('Error updating contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to update contact. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase.from('contacts').delete().eq('id', contactId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: 'Contact Deleted',
        description: 'The contact has been removed.',
      });
    },
    onError: error => {
      console.error('Error deleting contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete contact. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ contactId, newStatus }: { contactId: string; newStatus: string }) => {
      const { data, error } = await supabase
        .from('contacts')
        .update({
          status: newStatus.toLowerCase(),
          updated_at: new Date().toISOString(),
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
        title: 'Status Updated',
        description: "The contact's status has been updated.",
      });
    },
    onError: error => {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleOpenAddSheet = () => {
    setCurrentContact(null);
    setSheetMode('add');
    setIsSheetOpen(true);
  };

  const handleOpenEditSheet = (contact: Contact) => {
    setCurrentContact(contact);
    setSheetMode('edit');
    setIsSheetOpen(true);
  };

  const handleOpenViewSheet = (contact: Contact) => {
    setCurrentContact(contact);
    setSheetMode('view');
    setIsSheetOpen(true);
  };

  const filteredContacts = contacts
    .filter(
      contact =>
        contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (contact.company && contact.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (contact.specialty && contact.specialty.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter(contact => activeTab === 'all' || contact.type === activeTab);

  const handleDeleteContact = (contact: Contact) => {
    deleteContactMutation.mutate(contact.id);
  };

  const handleStatusChange = (contact: Contact, newStatus: string) => {
    updateStatusMutation.mutate({ contactId: contact.id, newStatus });
  };

  if (error) {
    toast({
      title: 'Error Loading Contacts',
      description: 'There was an error loading contacts. Please refresh the page.',
      variant: 'destructive',
    });
  }

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <PageHeader
          title="Contacts"
          description="Manage your clients, customers, suppliers, subcontractors, and employees"
        >
          <div className="relative w-full md:w-auto flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search contacts..."
              className="pl-9 rounded-md"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Filter className="h-4 w-4 mr-1" />
              Filter
              <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
            </Button>
            <Button size="sm" className="flex-1 md:flex-auto" onClick={handleOpenAddSheet}>
              <Plus className="h-4 w-4 mr-1" />
              Add Contact
            </Button>
          </div>
        </PageHeader>

        <Tabs
          defaultValue="all"
          className="animate-in"
          style={{ animationDelay: '0.15s' }}
          onValueChange={setActiveTab}
        >
          <TabsList>
            <TabsTrigger value="all" className="px-4">
              All Contacts
            </TabsTrigger>
            <TabsTrigger value="client" className="px-4">
              Clients
            </TabsTrigger>
            <TabsTrigger value="customer" className="px-4">
              Customers
            </TabsTrigger>
            <TabsTrigger value="supplier" className="px-4">
              Suppliers
            </TabsTrigger>
            <TabsTrigger value="subcontractor" className="px-4">
              Subcontractors
            </TabsTrigger>
            <TabsTrigger value="employee" className="px-4">
              Employees
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6 animate-in"
          style={{ animationDelay: '0.2s' }}
        >
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="rounded-lg border border-border bg-card shadow-sm h-[250px] animate-pulse overflow-hidden"
              >
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
            filteredContacts.map(contact => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onView={handleOpenViewSheet}
                onEdit={handleOpenEditSheet}
                onDelete={handleDeleteContact}
                onStatusChange={handleStatusChange}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center p-10 text-center">
              <Users className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium mb-1">No contacts found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
              <Button onClick={handleOpenAddSheet}>
                <Plus className="h-4 w-4 mr-1" />
                Add Your First Contact
              </Button>
            </div>
          )}
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {sheetMode === 'add' && 'Add New Contact'}
              {sheetMode === 'edit' && 'Edit Contact'}
              {sheetMode === 'view' && 'Contact Details'}
            </SheetTitle>
            {sheetMode !== 'view' && (
              <SheetDescription>
                {sheetMode === 'add'
                  ? 'Enter details for the new contact.'
                  : 'Update the contact information.'}
              </SheetDescription>
            )}
          </SheetHeader>

          <div className="py-4">
            {sheetMode === 'view' && currentContact && (
              <ContactDetail
                contact={currentContact}
                onClose={() => setIsSheetOpen(false)}
                onEdit={handleOpenEditSheet}
                onDelete={handleDeleteContact}
                onStatusChange={handleStatusChange}
              />
            )}

            {(sheetMode === 'add' || sheetMode === 'edit') && (
              <ContactForm
                initialData={sheetMode === 'edit' ? currentContact : null}
                onSubmit={
                  sheetMode === 'add' ? addContactMutation.mutate : updateContactMutation.mutate
                }
                onCancel={() => setIsSheetOpen(false)}
                isSubmitting={addContactMutation.isPending || updateContactMutation.isPending}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </PageTransition>
  );
};

export default Contacts;
