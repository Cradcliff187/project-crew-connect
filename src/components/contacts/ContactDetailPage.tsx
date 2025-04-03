
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useContact } from './hooks/useContact';
import ContactDetailCard from './ContactDetailCard';
import ContactActivitySection from './ContactActivitySection';
import ContactOptionsMenu from './ContactOptionsMenu';
import ContactDocuments from './ContactDocuments';
import EditContactSheet from './EditContactSheet';
import LoadingContactDetailPage from './LoadingContactDetailPage';
import PageTransition from '@/components/layout/PageTransition';

const ContactDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('details');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const { 
    contact, 
    loading, 
    notFound, 
    refreshContact 
  } = useContact(id);
  
  if (loading) {
    return <LoadingContactDetailPage />;
  }
  
  if (notFound || !contact) {
    return (
      <PageTransition>
        <div className="container max-w-5xl py-6">
          <div className="flex items-center mb-6">
            <Button variant="outline" size="icon" asChild className="mr-4">
              <Link to="/contacts">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Contact Not Found</h1>
          </div>
          
          <div className="bg-destructive/10 p-6 rounded-lg text-center">
            <h2 className="text-lg font-medium mb-2 text-destructive">
              We couldn't find this contact
            </h2>
            <p className="mb-4">
              The contact you're looking for doesn't exist or has been deleted.
            </p>
            <Button asChild>
              <Link to="/contacts">Return to Contacts</Link>
            </Button>
          </div>
        </div>
      </PageTransition>
    );
  }
  
  return (
    <PageTransition>
      <div className="container max-w-6xl py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Button variant="outline" size="icon" asChild className="mr-4">
              <Link to="/contacts">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">{contact.full_name}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              className="bg-[#0485ea] hover:bg-[#0375d1]"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Contact
            </Button>
            <ContactOptionsMenu contact={contact} onRefresh={refreshContact} />
          </div>
        </div>
        
        <Tabs 
          defaultValue="details" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <ContactDetailCard contact={contact} />
          </TabsContent>
          
          <TabsContent value="documents">
            <ContactDocuments contactId={contact.contact_id} />
          </TabsContent>
          
          <TabsContent value="activity">
            <ContactActivitySection contactId={contact.contact_id} />
          </TabsContent>
        </Tabs>
        
        <EditContactSheet 
          contact={contact}
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onSubmit={refreshContact}
        />
      </div>
    </PageTransition>
  );
};

export default ContactDetailPage;
