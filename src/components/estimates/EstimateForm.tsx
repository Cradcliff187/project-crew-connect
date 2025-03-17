
import { useState } from 'react';
import { X, Plus, Trash } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Define the form schema with validation
const estimateFormSchema = z.object({
  project: z.string().min(1, { message: "Project name is required" }),
  client: z.string().min(1, { message: "Client is required" }),
  description: z.string().optional(),
  location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
  }),
  items: z.array(z.object({
    description: z.string().min(1, { message: "Description is required" }),
    quantity: z.string().min(1, { message: "Quantity is required" }),
    unitPrice: z.string().min(1, { message: "Unit price is required" }),
  })).min(1, { message: "At least one item is required" }),
});

type EstimateFormValues = z.infer<typeof estimateFormSchema>;

interface EstimateFormProps {
  open: boolean;
  onClose: () => void;
}

const EstimateForm = ({ open, onClose }: EstimateFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const { toast } = useToast();

  // Initialize the form
  const form = useForm<EstimateFormValues>({
    resolver: zodResolver(estimateFormSchema),
    defaultValues: {
      project: '',
      client: '',
      description: '',
      location: {
        address: '',
        city: '',
        state: '',
        zip: '',
      },
      items: [{ description: '', quantity: '1', unitPrice: '0' }],
    },
  });

  // Set up the field array for dynamic estimate items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Fetch clients when the form opens
  useState(() => {
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('id, name')
          .eq('contact_type', 'client')
          .order('name');
          
        if (error) throw error;
        setClients(data || []);
      } catch (error) {
        console.error('Error fetching clients:', error);
        toast({
          title: "Error",
          description: "Failed to load clients. Please try again.",
          variant: "destructive"
        });
      }
    };
    
    fetchClients();
  }, []);

  // Calculate the total estimate amount
  const calculateTotal = () => {
    const items = form.getValues('items');
    return items.reduce((total, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      return total + (quantity * unitPrice);
    }, 0);
  };

  // Handle form submission
  const onSubmit = async (data: EstimateFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Generate a unique estimate ID
      const estimateId = `EST-${Date.now().toString().slice(-6)}`;
      
      // Calculate the total amount
      const totalAmount = calculateTotal();

      // Insert the estimate into the database
      const { error: estimateError } = await supabase
        .from('estimates')
        .insert({
          estimateid: estimateId,
          projectname: data.project,
          customerid: data.client,
          customername: clients.find(c => c.id === data.client)?.name || data.client,
          "job description": data.description,
          estimateamount: totalAmount,
          sitelocationaddress: data.location.address,
          sitelocationcity: data.location.city,
          sitelocationstate: data.location.state,
          sitelocationzip: data.location.zip,
          datecreated: new Date().toISOString(),
          status: 'draft',
          isactive: true
        });

      if (estimateError) throw estimateError;

      // Insert the estimate items
      const estimateItems = data.items.map(item => ({
        estimate_id: estimateId,
        description: item.description,
        quantity: parseFloat(item.quantity),
        unit_price: parseFloat(item.unitPrice),
        total_price: parseFloat(item.quantity) * parseFloat(item.unitPrice)
      }));

      const { error: itemsError } = await supabase
        .from('estimate_items')
        .insert(estimateItems);

      if (itemsError) throw itemsError;

      // Show success message
      toast({
        title: "Success",
        description: `Estimate ${estimateId} has been created.`,
      });

      // Close the form and reset
      onClose();
    } catch (error) {
      console.error('Error creating estimate:', error);
      toast({
        title: "Error",
        description: "Failed to create estimate. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
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

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location.address"
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
                  name="location.city"
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
                  name="location.state"
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
                  name="location.zip"
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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Items</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => append({ description: '', quantity: '1', unitPrice: '0' })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-start p-3 border rounded-md">
                  <div className="col-span-12 md:col-span-6">
                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description*</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter item description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-6 md:col-span-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity*</FormLabel>
                          <FormControl>
                            <Input placeholder="0" type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-6 md:col-span-3">
                    <FormField
                      control={form.control}
                      name={`items.${index}.unitPrice`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Price*</FormLabel>
                          <FormControl>
                            <Input placeholder="0.00" type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="hidden md:flex md:col-span-1 items-end justify-end pb-1.5">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm">Total Estimate Amount:</p>
                  <p className="text-lg font-semibold">${calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#0485ea] hover:bg-[#0373ce]" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Estimate"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EstimateForm;
