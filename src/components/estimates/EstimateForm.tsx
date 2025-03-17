
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Import custom components and utilities
import LocationFields from './components/LocationFields';
import EstimateItemFields from './components/EstimateItemFields';
import EstimateSummary from './components/EstimateSummary';
import { estimateFormSchema, type EstimateFormValues, type EstimateItem } from './schemas/estimateFormSchema';
import { calculateSubtotal } from './utils/estimateCalculations';

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

  // Fetch clients when the form opens
  useEffect(() => {
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
  }, [toast]);

  // Handle form submission
  const onSubmit = async (data: EstimateFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Make sure items match the EstimateItem type for calculations
      const typedItems: EstimateItem[] = data.items.map(item => ({
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }));
      
      // Calculate the total amount
      const totalAmount = calculateSubtotal(typedItems);
      const contingencyPercentage = parseFloat(data.contingency_percentage || '0');
      
      // Insert the estimate into the database
      const { data: estimateData, error: estimateError } = await supabase
        .from('estimates')
        .insert({
          projectname: data.project,
          customerid: data.client,
          customername: clients.find(c => c.id === data.client)?.name || '',
          "job description": data.description, // Note the space in column name
          estimateamount: totalAmount,
          contingency_percentage: contingencyPercentage,
          sitelocationaddress: data.location.address,
          sitelocationcity: data.location.city,
          sitelocationstate: data.location.state,
          sitelocationzip: data.location.zip,
          datecreated: new Date().toISOString(),
          status: 'draft',
          isactive: true
        })
        .select();

      if (estimateError) throw estimateError;
      
      if (!estimateData || estimateData.length === 0) {
        throw new Error('Failed to create estimate - no ID returned');
      }
      
      const estimateId = estimateData[0].estimateid;

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

            <LocationFields />

            <EstimateItemFields />

            <EstimateSummary />

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
