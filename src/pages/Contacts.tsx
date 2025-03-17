
import { useState } from 'react';
import { Search, Users, Plus, Filter, MoreHorizontal, ChevronDown, Mail, Phone, MapPin, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import PageTransition from '@/components/layout/PageTransition';
import Header from '@/components/layout/Header';

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
    lastContact: '2023-10-12'
  },
  {
    id: 'C-002',
    name: 'Sarah Williams',
    company: 'Vanguard Development',
    role: 'CEO',
    email: 'sarah@vanguarddev.com',
    phone: '(555) 987-6543',
    address: '5678 Oak Ave, Anytown, CA 12345',
    type: 'client',
    lastContact: '2023-10-08'
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
    lastContact: '2023-10-05'
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
    lastContact: '2023-10-02'
  },
  {
    id: 'C-005',
    name: 'Emma Davis',
    company: 'Metro Builders',
    role: 'Development Director',
    email: 'emma@metrobuilders.com',
    phone: '(555) 456-7890',
    address: '1314 Cedar Blvd, Anytown, CA 12345',
    type: 'client',
    lastContact: '2023-09-28'
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
    lastContact: '2023-09-25'
  },
];

const Contacts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const filteredContacts = contactsData
    .filter(contact => 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(contact => activeTab === 'all' || contact.type === activeTab);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };
  
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <div className="flex flex-col gap-2 mb-6 animate-in">
            <h1 className="text-3xl font-semibold tracking-tight">Contacts</h1>
            <p className="text-muted-foreground">
              Manage your contacts and business relationships
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
              <Button size="sm" className="flex-1 md:flex-auto btn-premium">
                <Plus className="h-4 w-4 mr-1" />
                Add Contact
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="animate-in" style={{ animationDelay: '0.15s' }} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all" className="px-4">All Contacts</TabsTrigger>
              <TabsTrigger value="client" className="px-4">Clients</TabsTrigger>
              <TabsTrigger value="subcontractor" className="px-4">Subcontractors</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6 animate-in" style={{ animationDelay: '0.2s' }}>
            {filteredContacts.map((contact) => (
              <Card key={contact.id} className="premium-card overflow-hidden">
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{contact.name}</h3>
                      <div className="flex items-center gap-1 text-sm mt-1 text-muted-foreground">
                        <Building className="h-3 w-3" />
                        <span>{contact.company}</span>
                      </div>
                      <p className="text-xs text-construction-700 mt-1 rounded-full bg-construction-50 inline-block px-2 py-0.5">
                        {contact.role}
                      </p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit contact</DropdownMenuItem>
                        <DropdownMenuItem>View projects</DropdownMenuItem>
                        <DropdownMenuItem>View estimates</DropdownMenuItem>
                        <DropdownMenuItem>Send email</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a href={`mailto:${contact.email}`} className="text-construction-700 hover:underline">{contact.email}</a>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a href={`tel:${contact.phone}`} className="hover:text-construction-700">{contact.phone}</a>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                      <span className="text-muted-foreground">{contact.address}</span>
                    </div>
                  </div>
                </div>
                
                <div className="px-5 py-3 bg-secondary/30 border-t border-border/50 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Last contacted: {formatDate(contact.lastContact)}</span>
                  <div className="space-x-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            
            {filteredContacts.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center p-10 text-center">
                <Users className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium mb-1">No contacts found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
                <Button className="btn-premium">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Your First Contact
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Contacts;
