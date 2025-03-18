
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { statusOptions } from './ProjectConstants';
import { supabase } from '@/integrations/supabase/client';
import { projectFormSchema, type ProjectFormValues } from './schemas/projectFormSchema';
import CustomerForm from './CustomerForm';
import { format } from 'date-fns';

interface ProjectFormProps {
  onSubmit: (data: ProjectFormValues) => void;
  isSubmitting: boolean;
  estimateData?: {
    id: string;
    name: string;
    customerName?: string;
    customerId?: string;
    description?: string;
    location?: {
      address?: string;
      city?: string;
      state?: string;
      zip?: string;
    };
  };
}

const ProjectForm = ({ onSubmit, isSubmitting, estimateData }: ProjectFormProps) => {
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [customerTab, setCustomerTab] = useState<'existing' | 'new'>('existing');
  const [useDifferentSiteLocation, setUseDifferentSiteLocation] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  // Initialize form with default values
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      projectName: estimateData?.name || '',
      customerId: estimateData?.customerId || '',
      jobDescription: estimateData?.description || '',
      status: 'active',
      estimateId: estimateData?.id || '',
      siteLocationSameAsCustomer: true,
      siteLocation: {
        address: estimateData?.location?.address || '',
        city: estimateData?.location?.city || '',
        state: estimateData?.location?.state || '',
        zip: estimateData?.location?.zip || '',
      },
      dueDate: undefined,
      newCustomer: {
        customerName: estimateData?.customerName || '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
      }
    }
  });

  // Fetch customers when component mounts
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

    fetchCustomers();
  }, []);

  // Handle site location checkbox change
  useEffect(() => {
    if (!useDifferentSiteLocation) {
      form.setValue('siteLocationSameAsCustomer', true);
    } else {
      form.setValue('siteLocationSameAsCustomer', false);
    }
  }, [useDifferentSiteLocation, form]);

  const handleFormSubmit = (data: ProjectFormValues) => {
    onSubmit(data);
  };

  const handleShowCustomerForm = () => {
    setShowCustomerForm(true);
    setCustomerTab('new');
  };

  return (
    <Form {...form}>
      <form id="project-form" onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="projectName"
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

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Customer Information</h3>
            {!showCustomerForm && customerTab === 'existing' && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleShowCustomerForm}
                className="text-[#0485ea]"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add New Customer
              </Button>
            )}
          </div>

          {!showCustomerForm ? (
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Customer*</FormLabel>
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
          ) : (
            <Tabs defaultValue="new" value={customerTab} onValueChange={(value) => setCustomerTab(value as 'existing' | 'new')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="existing" onClick={() => setShowCustomerForm(false)}>Existing Customer</TabsTrigger>
                <TabsTrigger value="new">New Customer</TabsTrigger>
              </TabsList>
              <TabsContent value="new" className="space-y-4 pt-4">
                <CustomerForm form={form} />
              </TabsContent>
            </Tabs>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Project Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP")
                        ) : (
                          <span>Select a date</span>
                        )}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date ? date.toISOString() : undefined)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
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
          name="jobDescription"
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

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="different-site" 
            checked={useDifferentSiteLocation}
            onCheckedChange={(checked) => setUseDifferentSiteLocation(checked as boolean)}
          />
          <label
            htmlFor="different-site"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Site location is different from customer address
          </label>
        </div>

        {useDifferentSiteLocation && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Site Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="siteLocation.address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="siteLocation.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter city" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="siteLocation.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter state" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="siteLocation.zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter ZIP code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}
      </form>
    </Form>
  );
};

export default ProjectForm;
