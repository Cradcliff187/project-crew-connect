
import { useState, useEffect } from 'react';
import { Search, Users, Plus, Filter, ChevronDown, Star } from 'lucide-react';
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

// Sample data - In a real app, this would come from API calls
const contactsData = [
  {
    id: 'C-001',
    name: 'Michael Robertson',
    company: 'Jackson Properties',
    role: 'Project Manager',
    email: 'michael@jacksonproperties.com',
    phone: '(555) 123-4567',
    address: '1234 Main St, Anytown, CA 12345',
    type: 'client',
    lastContact: '2023-10-12',
    notes: 'Interested in commercial projects only.'
  },
  {
    id: 'C-002',
    name: 'Sarah Williams',
    company: 'Vanguard Development',
    role: 'CEO',
    email: 'sarah@vanguarddev.com',
    phone: '(555) 987-6543',
    address: '5678 Oak Ave, Anytown, CA 12345',
    type: 'customer',
    lastContact: '2023-10-08',
    notes: 'Has ongoing projects with us.'
  },
  {
    id: 'C-003',
    name: 'James Thompson',
    company: 'Elite Electrical',
    role: 'Owner',
    email: 'james@eliteelectrical.com',
    phone: '(555) 234-5678',
    address: '910 Pine St, Anytown, CA 12345',
    type: 'subcontractor',
    specialty: 'Electrical',
    hourlyRate: '85',
    lastContact: '2023-10-05',
    notes: 'Reliable electrical contractor.'
  },
  {
    id: 'C-004',
    name: 'Alex Martinez',
    company: 'Quality Plumbing',
    role: 'Lead Plumber',
    email: 'alex@qualityplumbing.com',
    phone: '(555) 345-6789',
    address: '1122 Maple Dr, Anytown, CA 12345',
    type: 'subcontractor',
    specialty: 'Plumbing',
    hourlyRate: '75',
    lastContact: '2023-10-02',
    notes: 'Available for emergency work.'
  },
  {
    id: 'C-005',
    name: 'Emma Davis',
    company: 'Metro Builders',
    role: 'Development Director',
    email: 'emma@metrobuilders.com',
    phone: '(555) 456-7890',
    address: '1314 Cedar Blvd, Anytown, CA 12345',
    type: 'customer',
    lastContact: '2023-09-28',
    notes: 'Repeat customer, interested in residential projects.'
  },
  {
    id: 'C-006',
    name: 'Robert Chen',
    company: 'Precision Concrete',
    role: 'Foreman',
    email: 'robert@precisionconcrete.com',
    phone: '(555) 567-8901',
    address: '1516 Elm St, Anytown, CA 12345',
    type: 'subcontractor',
    specialty: 'Concrete',
    hourlyRate: '65',
    lastContact: '2023-09-25',
    notes: 'Specializes in decorative concrete work.'
  },
  {
    id: 'C-007',
    name: 'Lisa Johnson',
    company: 'Johnson Hardware Supplies',
    role: 'Sales Manager',
    email: 'lisa@johnsonhardware.com',
    phone: '(555) 678-9012',
    address: '1718 Birch Ave, Anytown, CA 12345',
    type: 'supplier',
    specialty: 'Hardware',
    materials: 'Nails, screws, fasteners, tools, and general hardware supplies',
    lastContact: '2023-09-20',
    notes: 'Offers contractor discounts.'
  },
  {
    id: 'C-008',
    name: 'David Miller',
    company: 'Miller Lumber Co',
    role: 'Owner',
    email: 'david@millerlumber.com',
    phone: '(555) 789-0123',
    address: '1920 Walnut St, Anytown, CA 12345',
    type: 'supplier',
    specialty: 'Lumber',
    materials: 'Dimensional lumber, plywood, OSB, treated wood products',
    lastContact: '2023-09-15',
    notes: 'Can source specialty woods.'
  },
  {
    id: 'C-009',
    name: 'Jennifer Parker',
    role: 'Project Manager',
    email: 'jennifer.parker@akcconstruction.com',
    phone: '(555) 234-5677',
    type: 'employee',
    hourlyRate: '45',
    lastContact: '2022-06-15',
    notes: 'Handles commercial projects primarily.'
  },
  {
    id: 'C-010',
    name: 'Thomas Wright',
    role: 'Senior Carpenter',
    email: 'thomas.wright@akcconstruction.com',
    phone: '(555) 987-3456',
    type: 'employee',
    hourlyRate: '38',
    lastContact: '2021-03-10',
    notes: 'Specialized in finish carpentry.'
  }
];

const Contacts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [contacts, setContacts] = useState(contactsData);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter contacts based on search query and active tab
  const filteredContacts = contacts
    .filter(contact => 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.company && contact.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.specialty && contact.specialty.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter(contact => activeTab === 'all' || contact.type === activeTab);
  
  // Function to handle adding a new contact
  const handleAddContact = async (data: any) => {
    try {
      // In a real implementation, this would be an API call to store the contact
      // For now, we'll just use the sample data approach
      const newContact = {
        ...data,
        id: `C-${(contacts.length + 1).toString().padStart(3, '0')}`,
        lastContact: new Date().toISOString()
      };
      
      setContacts([newContact, ...contacts]);
      setShowForm(false);
      
      toast({
        title: "Contact Added",
        description: `${newContact.name} has been added to your contacts.`
      });

      // Example of what a real implementation might look like using Supabase
      /*
      let table = '';
      let payload = { ...data };
      
      // Determine which table to use based on contact type
      switch (data.type) {
        case 'client':
        case 'customer':
          table = 'customers';
          payload = {
            customername: data.name,
            contactemail: data.email,
            phone: data.phone,
            address: data.address,
            status: data.status,
            notes: data.notes,
            rating: data.rating
          };
          break;
        case 'supplier':
          table = 'vendors';
          payload = {
            vendorname: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            status: data.status,
            notes: data.notes,
            rating: data.rating
          };
          break;
        case 'subcontractor':
          table = 'subcontractors';
          payload = {
            subname: data.name,
            contactemail: data.email,
            phone: data.phone,
            address: data.address,
            status: data.status,
            notes: data.notes,
            rating: data.rating,
            specialty: data.specialty
          };
          break;
        case 'employee':
          table = 'employees';
          payload = {
            first_name: data.name.split(' ')[0],
            last_name: data.name.split(' ').slice(1).join(' '),
            email: data.email,
            phone: data.phone,
            role: data.role,
            hourly_rate: data.hourlyRate,
            status: data.status
          };
          break;
      }
      
      const { error } = await supabase.from(table).insert(payload);
      
      if (error) {
        toast({
          title: "Error",
          description: `Failed to add contact: ${error.message}`,
          variant: "destructive"
        });
        return;
      }
      
      // Refresh contacts after adding
      fetchContacts();
      */
    } catch (error) {
      console.error("Error adding contact:", error);
      toast({
        title: "Error",
        description: "Failed to add contact",
        variant: "destructive"
      });
    }
  };
  
  // Function to handle editing a contact
  const handleEditContact = (data: any) => {
    const updatedContacts = contacts.map(contact => 
      contact.id === editingContact.id ? { ...contact, ...data } : contact
    );
    
    setContacts(updatedContacts);
    setEditingContact(null);
    
    toast({
      title: "Contact Updated",
      description: `${data.name}'s information has been updated.`
    });
  };
  
  // Function to handle deleting a contact
  const handleDeleteContact = (contact: any) => {
    const updatedContacts = contacts.filter(c => c.id !== contact.id);
    setContacts(updatedContacts);
    
    toast({
      title: "Contact Deleted",
      description: `${contact.name} has been removed from your contacts.`
    });
  };

  // Function to handle contact status transitions
  const handleStatusChange = (contact: any, newStatus: string) => {
    const updatedContacts = contacts.map(c => 
      c.id === contact.id ? { ...c, status: newStatus } : c
    );
    
    setContacts(updatedContacts);
    
    toast({
      title: "Status Updated",
      description: `${contact.name}'s status changed to ${newStatus}`
    });
  };
  
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
            {filteredContacts.map((contact) => (
              <ContactCard 
                key={contact.id} 
                contact={contact} 
                onView={(contact) => setSelectedContact(contact)}
                onEdit={(contact) => setEditingContact(contact)}
                onDelete={handleDeleteContact}
                onStatusChange={handleStatusChange}
              />
            ))}
            
            {filteredContacts.length === 0 && (
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
