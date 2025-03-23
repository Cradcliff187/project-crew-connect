
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import custom components and utilities
import LocationFields from './components/LocationFields';
import EstimateItemFields from './components/EstimateItemFields';
import EstimateSummary from './components/EstimateSummary';
import EstimateFormButtons from './components/EstimateFormButtons';
import CustomerFormFields from './components/CustomerFormFields';
import { useEstimateSubmit } from './hooks/useEstimateSubmit';
import { estimateFormSchema, type EstimateFormValues } from './schemas/estimateFormSchema';
import EstimatePreview from './components/EstimatePreview';

interface EstimateFormProps {
  open: boolean;
  onClose: () => void;
}

const EstimateForm = ({ open, onClose }: EstimateFormProps) => {
  const [customers, setCustomers] = useState<{ id: string; name: string; address?: string; city?: string; state?: string; zip?: string; }[]>([]);
  const [customerTab, setCustomerTab] = useState<'existing' | 'new'>('existing');
  const [selectedCustomerAddress, setSelectedCustomerAddress] = useState<string | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState<string | null>(null);
  const [step, setStep] = useState<'edit' | 'preview'>('edit');
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
      items: [{ description: '', quantity: '1', unitPrice: '0', cost: '0', markup_percentage: '0' }],
      showSiteLocation: false,
      isNewCustomer: false,
      newCustomer: {
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
      },
    },
  });

  // Watch for form value changes
  const customerId = form.watch('customer');
  const showSiteLocation = form.watch('showSiteLocation');
  const isNewCustomer = form.watch('isNewCustomer');

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
      setStep('edit');
    }
  }, [open]);

  // Fetch customer address when customer is selected
  useEffect(() => {
    if (customerId && !isNewCustomer) {
      const selectedCustomer = customers.find(c => c.id === customerId);
      
      if (selectedCustomer) {
        setSelectedCustomerName(selectedCustomer.name);
        
        if (selectedCustomer.address && selectedCustomer.city && selectedCustomer.state) {
          const formattedAddress = `${selectedCustomer.address}, ${selectedCustomer.city}, ${selectedCustomer.state} ${selectedCustomer.zip || ''}`.trim();
          setSelectedCustomerAddress(formattedAddress);
        } else {
          setSelectedCustomerAddress(null);
        }
      }
    } else {
      setSelectedCustomerAddress(null);
      setSelectedCustomerName(null);
    }
  }, [customerId, customers, isNewCustomer]);

  // Handle form submission
  const onSubmit = async (data: EstimateFormValues) => {
    await submitEstimate(data, customers, onClose);
  };

  const handlePreview = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      setStep('preview');
    }
  };

  const handleBackToEdit = () => {
    setStep('edit');
  };

  const handleNewCustomer = () => {
    form.setValue('isNewCustomer', true);
    form.setValue('customer', '');
    setCustomerTab('new');
  };

  const handleExistingCustomer = () => {
    form.setValue('isNewCustomer', false);
    setCustomerTab('existing');
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-2xl font-semibold">
            {step === 'edit' ? 'Create New Estimate' : 'Review Estimate'}
            {step === 'preview' && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={handleBackToEdit} 
                className="ml-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Edit
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-6 pb-6">
            {step === 'edit' ? (
              <>
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

                  <div>
                    {!isNewCustomer ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <FormLabel>Customer*</FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-xs text-[#0485ea] h-6 px-2"
                            onClick={handleNewCustomer}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add New Customer
                          </Button>
                        </div>
                        <FormField
                          control={form.control}
                          name="customer"
                          render={({ field }) => (
                            <FormItem>
                              <Select onValueChange={(value) => {
                                field.onChange(value);
                                form.setValue('showSiteLocation', false);
                              }} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a customer" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-white">
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
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <FormLabel>Customer</FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-xs text-[#0485ea] h-6 px-2"
                            onClick={handleExistingCustomer}
                          >
                            Select Existing Customer
                          </Button>
                        </div>
                        <Tabs defaultValue="new" value={customerTab} onValueChange={(value) => setCustomerTab(value as 'existing' | 'new')}>
                          <TabsContent value="new" className="mt-2 p-0">
                            <CustomerFormFields />
                          </TabsContent>
                        </Tabs>
                      </div>
                    )}
                  </div>
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

                {selectedCustomerAddress && !isNewCustomer && (
                  <Card className="border-[#0485ea]/20 bg-[#0485ea]/5">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex gap-2 items-start">
                        <AlertCircle className="h-5 w-5 text-[#0485ea] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-[#0485ea]">
                            Customer address for {selectedCustomerName}:
                          </p>
                          <p className="text-sm text-gray-700">
                            {selectedCustomerAddress}
                          </p>
                          <div className="mt-2 flex items-center space-x-2">
                            <Checkbox
                              id="site-location"
                              checked={showSiteLocation}
                              onCheckedChange={(checked) => {
                                form.setValue('showSiteLocation', checked as boolean);
                              }}
                            />
                            <label
                              htmlFor="site-location"
                              className="text-sm text-gray-700 cursor-pointer"
                            >
                              Site location is different from customer address
                            </label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {(showSiteLocation || isNewCustomer || !selectedCustomerAddress) && (
                  <LocationFields />
                )}

                <EstimateItemFields />

                <EstimateSummary />

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    className="bg-[#0485ea] hover:bg-[#0373ce]" 
                    onClick={handlePreview}
                  >
                    Preview Estimate
                  </Button>
                </div>
              </>
            ) : (
              <>
                <EstimatePreview 
                  formData={form.getValues()} 
                  selectedCustomerName={selectedCustomerName}
                  selectedCustomerAddress={selectedCustomerAddress}
                />
                <EstimateFormButtons onCancel={onClose} isSubmitting={isSubmitting} />
              </>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EstimateForm;
