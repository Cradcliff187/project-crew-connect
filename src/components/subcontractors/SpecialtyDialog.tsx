import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Check, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SpecialtyFormData {
  specialty: string;
  description: string;
}

interface SpecialtyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSpecialtyAdded: () => void;
}

const SpecialtyDialog = ({ open, onOpenChange, onSpecialtyAdded }: SpecialtyDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SpecialtyFormData>({
    defaultValues: {
      specialty: '',
      description: '',
    },
  });

  const onSubmit = async (data: SpecialtyFormData) => {
    setIsSubmitting(true);

    try {
      const { data: specialty, error } = await supabase
        .from('subcontractor_specialties')
        .insert({
          specialty: data.specialty,
          description: data.description,
        })
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: 'Specialty created successfully',
        description: `${data.specialty} has been added to available specialties.`,
      });

      form.reset();
      onOpenChange(false);
      onSpecialtyAdded();
    } catch (error: any) {
      console.error('Error creating specialty:', error);
      toast({
        title: 'Error creating specialty',
        description:
          error.message || 'There was an error creating the specialty. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Specialty</DialogTitle>
          <DialogDescription>
            Create a new specialty that can be assigned to subcontractors.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="specialty-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="specialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialty Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Electrical, Plumbing, Framing" {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a description of this specialty"
                      className="resize-none h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

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
            form="specialty-form"
            className="bg-[#0485ea] hover:bg-[#0375d1]"
            disabled={isSubmitting}
          >
            <Check className="h-4 w-4 mr-1" />
            {isSubmitting ? 'Creating...' : 'Create Specialty'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SpecialtyDialog;
