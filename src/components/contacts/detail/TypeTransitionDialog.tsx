
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Check, 
  X, 
  ExternalLink, 
  AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Contact } from '@/pages/Contacts';
import { transitionContactType, getDefaultStatusForType } from './util/contactTransitions';

const formSchema = z.object({
  new_type: z.enum(['client', 'customer', 'supplier', 'subcontractor', 'employee'], {
    required_error: "Please select a contact type",
  }),
});

interface TypeTransitionDialogProps {
  contact: Contact;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const TypeTransitionDialog = ({ 
  contact, 
  open, 
  onOpenChange, 
  onSuccess 
}: TypeTransitionDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      new_type: contact.type,
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (values.new_type === contact.type) {
      onOpenChange(false);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const success = await transitionContactType(contact, values.new_type);
      
      if (success) {
        onSuccess();
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error during contact type transition:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const newType = form.watch('new_type');
  const newStatus = getDefaultStatusForType(newType);
  const willStatusChange = contact.type !== newType;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Change Contact Type</DialogTitle>
          <DialogDescription>
            You are changing the contact type for <strong>{contact.name}</strong>. 
            This will also update the contact's status.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <h3 className="text-sm font-medium">Current Type</h3>
                <div className="px-3 py-2 rounded-md bg-muted text-muted-foreground">
                  <span className="capitalize">{contact.type}</span>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <h3 className="text-sm font-medium">Current Status</h3>
                <div className="px-3 py-2 rounded-md bg-muted text-muted-foreground">
                  {contact.status || 'None'}
                </div>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="new_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Contact Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select new type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="supplier">Supplier</SelectItem>
                      <SelectItem value="subcontractor">Subcontractor</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Selecting a new type will change what fields and features are available for this contact.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {willStatusChange && (
              <Alert variant="info">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Status will change</AlertTitle>
                <AlertDescription>
                  Changing to <span className="font-medium capitalize">{newType}</span> will set the status to <span className="font-medium">{newStatus}</span>.
                </AlertDescription>
              </Alert>
            )}
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-[#0485ea] hover:bg-[#0375d1]"
                disabled={isSubmitting}
              >
                <Check className="h-4 w-4 mr-1" />
                {isSubmitting ? 'Saving...' : 'Change Type'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TypeTransitionDialog;
