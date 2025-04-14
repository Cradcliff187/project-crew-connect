import { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Contact } from '@/pages/Contacts';
import { transitionContactType } from './util/contactTransitions';
import { toast } from '@/hooks/use-toast';

interface TypeTransitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact;
  currentType?: string;
  onTypeChange: (newType: string) => Promise<void> | void;
  onSuccess?: () => void;
}

const formSchema = z.object({
  newType: z.enum(['client', 'customer', 'supplier', 'subcontractor', 'employee'], {
    required_error: 'Please select a contact type',
  }),
  confirmation: z.boolean().refine(val => val === true, {
    message: 'You must confirm this action',
  }),
});

const contactTypeOptions = [
  { value: 'client', label: 'Client' },
  { value: 'customer', label: 'Customer' },
  { value: 'supplier', label: 'Supplier' },
  { value: 'subcontractor', label: 'Subcontractor' },
  { value: 'employee', label: 'Employee' },
];

const getTypeDescription = (type: string) => {
  switch (type) {
    case 'client':
      return 'Organizations or individuals that engage your services for long-term projects or recurring work';
    case 'customer':
      return 'Individuals or businesses that purchase your products or services on a more transactional basis';
    case 'supplier':
      return 'Vendors that provide materials, products, or goods to your organization';
    case 'subcontractor':
      return 'Independent workers or companies that perform specific tasks or portions of a project';
    case 'employee':
      return 'Individuals who work directly for your company as staff members';
    default:
      return '';
  }
};

const TypeTransitionDialog = ({
  open,
  onOpenChange,
  contact,
  currentType,
  onTypeChange,
  onSuccess,
}: TypeTransitionDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactType = contact?.type || currentType;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newType: undefined,
      confirmation: false,
    },
  });

  const selectedType = form.watch('newType');

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (values.newType === contactType) {
      toast({
        title: 'No Change',
        description: 'The selected type is the same as the current type.',
        variant: 'default',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (contact) {
        const success = await transitionContactType(contact, values.newType);

        if (success) {
          toast({
            title: 'Type Changed',
            description: `Contact has been updated to ${values.newType}.`,
            variant: 'default',
          });

          onOpenChange(false);
          form.reset();

          if (onSuccess) {
            onSuccess();
          }
        }
      } else {
        await onTypeChange(values.newType);

        toast({
          title: 'Type Changed',
          description: `Contact has been updated to ${values.newType}.`,
          variant: 'default',
        });

        onOpenChange(false);
        form.reset();

        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Error transitioning contact type:', error);
      toast({
        title: 'Error',
        description: 'Failed to update contact type. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Change Contact Type</DialogTitle>
          <DialogDescription>
            Change the type of contact from <strong>{contactType}</strong> to a new type. This may
            affect how the contact is managed in the system.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="newType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Contact Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a new type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {contactTypeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedType && (
                    <FormDescription>{getTypeDescription(selectedType)}</FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedType && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Changing a contact's type will reset its status to the default status for the new
                  type and may affect related records.
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="confirmation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <input
                      type="checkbox"
                      className="h-4 w-4 mt-1"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>I confirm this change and understand its implications</FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#0485ea] hover:bg-[#0375d1]"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Change Type'}
                {!isSubmitting && <Check className="ml-2 h-4 w-4" />}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TypeTransitionDialog;
