import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Import custom components and utilities
import LocationFields from './components/LocationFields';
import EstimateItemFields from './components/EstimateItemFields';
import EstimateSummary from './components/EstimateSummary';
import EstimateFormButtons from './components/EstimateFormButtons';
import { useEstimateSubmit } from './hooks/useEstimateSubmit';
import { estimateFormSchema, type EstimateFormValues } from './schemas/estimateFormSchema';

interface EstimateFormProps {
  open: boolean;
  onClose: () => void;
}

const EstimateForm = ({ open, onClose }: EstimateFormProps) => {
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const { isSubmitting, submitEstimate } = useEstimateSubmit();

  // Initialize the form
  const form = useForm<EstimateFormValues>({
    resolver: zodResolver(estimateFormSchema),
    defaultValues: {
      project: '',
      customer: '',
      description: '',
      contingency_percentage: '0',
      location: {
        address: '',
        city: '',
        state: '',
        zip: '',
      },
      items: [{ description: '', quantity: '1', unitPrice: '0' }],
    },
  });

  // Fetch customers when the form opens
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('customerid, customername')
          .order('customername');
          
        if (error) throw error;
        setCustomers(data?.map(c => ({ id: c.customerid, name: c.customername || '' })) || []);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
    
    if (open) {
      fetchCustomers();
    }
  }, [open]);

  // Handle form submission
  const onSubmit = async (data: EstimateFormValues) => {
    await submitEstimate(data, customers, onClose);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-2xl font-semibold">Create New Estimate</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="project"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter job description" 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <LocationFields />

            <EstimateItemFields />

            <EstimateSummary />

            <EstimateFormButtons onCancel={onClose} isSubmitting={isSubmitting} />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EstimateForm;
