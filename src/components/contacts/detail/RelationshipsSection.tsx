
import { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Contact } from '@/pages/Contacts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  ContactRelationship,
  fetchContactRelationships,
  addContactRelationship,
  removeContactRelationship,
  getRelationshipTypeOptions
} from './util/contactRelationships';

interface RelationshipsSectionProps {
  contact: Contact;
}

const formSchema = z.object({
  relatedContactId: z.string({
    required_error: "Please select a contact",
  }),
  relationshipType: z.string({
    required_error: "Please select a relationship type",
  }),
  notes: z.string().optional(),
});

const RelationshipsSection = ({ contact }: RelationshipsSectionProps) => {
  const [relationships, setRelationships] = useState<ContactRelationship[]>([]);
  const [relatedContacts, setRelatedContacts] = useState<Contact[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      relatedContactId: '',
      relationshipType: '',
      notes: '',
    },
  });

  useEffect(() => {
    const loadRelationships = async () => {
      setLoading(true);
      try {
        const data = await fetchContactRelationships(contact.id);
        setRelationships(data);
        
        // Fetch all contacts for the selection dropdown (excluding the current contact)
        const { data: contactsData, error } = await supabase
          .from('contacts')
          .select('*')
          .neq('id', contact.id);
        
        if (error) throw error;
        setRelatedContacts(contactsData || []);
      } catch (error) {
        console.error("Error loading relationships:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadRelationships();
  }, [contact.id, refreshTrigger]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await addContactRelationship(
        contact.id,
        values.relatedContactId,
        values.relationshipType,
        values.notes
      );
      setShowAddDialog(false);
      form.reset();
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Error adding relationship:", error);
    }
  };

  const handleDelete = async (relationshipId: string) => {
    if (confirm("Are you sure you want to remove this relationship?")) {
      const success = await removeContactRelationship(relationshipId);
      if (success) {
        setRefreshTrigger(prev => prev + 1);
      }
    }
  };

  const getRelatedContactName = (contactId: string) => {
    const relatedContact = relatedContacts.find(c => c.id === contactId);
    return relatedContact ? relatedContact.name : 'Unknown Contact';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Business Relationships</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            size="sm" 
            variant="default" 
            className="bg-[#0485ea] hover:bg-[#0375d1]"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Relationship
          </Button>
        </div>
      </div>

      {relationships.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No relationships have been added for this contact.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {relationships.map(relationship => (
            <Card key={relationship.id} className="overflow-hidden">
              <CardHeader className="py-3 px-4 flex flex-row justify-between items-center space-y-0">
                <CardTitle className="text-base font-medium flex-1">
                  {relationship.from_contact_id === contact.id 
                    ? `${contact.name} → ${getRelatedContactName(relationship.to_contact_id)}`
                    : `${getRelatedContactName(relationship.from_contact_id)} → ${contact.name}`}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-red-500 hover:text-red-600"
                  onClick={() => handleDelete(relationship.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="py-3 px-4 border-t bg-muted/20">
                <div className="flex flex-col md:flex-row justify-between gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground mr-2">Relationship:</span>
                    <span className="font-medium">{relationship.relationship_type}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground mr-2">Created:</span>
                    <span>{new Date(relationship.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                {relationship.notes && (
                  <div className="mt-2 text-sm">
                    <span className="text-muted-foreground mr-2">Notes:</span>
                    <span>{relationship.notes}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Relationship</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="relatedContactId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related Contact</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a contact" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {relatedContacts.map(relatedContact => (
                          <SelectItem key={relatedContact.id} value={relatedContact.id}>
                            {relatedContact.name} ({relatedContact.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="relationshipType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getRelationshipTypeOptions().map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any additional details about this relationship" 
                        className="resize-none h-20"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#0485ea] hover:bg-[#0375d1]"
                >
                  Add Relationship
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RelationshipsSection;
