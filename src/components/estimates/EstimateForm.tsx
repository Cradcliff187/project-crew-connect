
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  const [customers, setCustomers] = useState<{ id: string; name: string; address?: string; city?: string; state?: string; zip?: string }[]>([]);
  const [useCustomLocation, setUseCustomLocation] = useState(false);
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
      items: [{ 
        description: '', 
        quantity: '1', 
        cost: '0',
        markup_percentage: '20',
        item_type: 'labor'
      }],
    },
  });

  // Fetch customers when the form opens
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('customerid, customername, address, city, state, zip')
          .order('customername');
          
        if (error) throw error;
        setCustomers(data?.map(c => ({ 
          id: c.customerid, 
          name: c.customername || '',
          address: c.address,
          city: c.city,
          state: c.state,
          zip: c.zip
        })) || []);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
    
    if (open) {
      fetchCustomers();
    }
  }, [open]);

  // Handle customer selection to populate address if needed
  const handleCustomerChange = (customerId: string) => {
    form.setValue('customer', customerId);
    
    if (!useCustomLocation) {
      const selectedCustomer = customers.find(c => c.id === customerId);
      if (selectedCustomer) {
        form.setValue('location.address', selectedCustomer.address || '');
        form.setValue('location.city', selectedCustomer.city || '');
        form.setValue('location.state', selectedCustomer.state || '');
        form.setValue('location.zip', selectedCustomer.zip || '');
      }
    }
  };

  // Handle toggle for custom location
  const handleCustomLocationToggle = (checked: boolean) => {
    setUseCustomLocation(checked);
    
    if (checked) {
      // Clear location fields when custom location is selected
      form.setValue('location.address', '');
      form.setValue('location.city', '');
      form.setValue('location.state', '');
      form.setValue('location.zip', '');
    } else if (form.getValues('customer')) {
      // Reset to customer address when switching back
      const selectedCustomer = customers.find(c => c.id === form.getValues('customer'));
      if (selectedCustomer) {
        form.setValue('location.address', selectedCustomer.address || '');
        form.setValue('location.city', selectedCustomer.city || '');
        form.setValue('location.state', selectedCustomer.state || '');
        form.setValue('location.zip', selectedCustomer.zip || '');
      }
    }
  };

  // Handle form submission
  const onSubmit = async (data: EstimateFormValues) => {
    await submitEstimate(data, customers, onClose);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 font-sans">
        <DialogHeader className="sticky top-0 z-10 bg-white px-6 pt-6 pb-4 border-b shadow-sm">
          <DialogTitle className="text-2xl font-bold font-montserrat text-[#0485ea]">Create New Estimate</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-montserrat font-semibold mb-4 text-[#333333]">Project Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="project"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#333333] font-medium">Project Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter project name" {...field} className="border-gray-300 focus:border-[#0485ea] focus:ring-[#0485ea]" />
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
                      <FormLabel className="text-[#333333] font-medium">Customer*</FormLabel>
                      <Select 
                        onValueChange={handleCustomerChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="border-gray-300 focus:border-[#0485ea] focus:ring-[#0485ea]">
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
                  <FormItem className="mt-4">
                    <FormLabel className="text-[#333333] font-medium">Job Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter detailed job description" 
                        className="min-h-[120px] border-gray-300 focus:border-[#0485ea] focus:ring-[#0485ea]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-montserrat font-semibold mb-4 text-[#333333]">Location Details</h2>
              
              <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                <Switch
                  id="custom-location"
                  checked={useCustomLocation}
                  onCheckedChange={handleCustomLocationToggle}
                  className="data-[state=checked]:bg-[#0485ea]"
                />
                <label
                  htmlFor="custom-location"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Job site location is different from customer address
                </label>
              </div>

              <LocationFields />
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <EstimateItemFields />
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <EstimateSummary />
            </div>

            <EstimateFormButtons onCancel={onClose} isSubmitting={isSubmitting} />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EstimateForm;
