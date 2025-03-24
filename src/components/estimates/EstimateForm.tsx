
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Import custom components and utilities
import EstimatePreview from './components/EstimatePreview';
import EstimateFormButtons from './components/EstimateFormButtons';
import { useEstimateSubmit } from './hooks/useEstimateSubmit';
import { estimateFormSchema, type EstimateFormValues } from './schemas/estimateFormSchema';
import EditFormContent from './components/form-steps/EditFormContent';

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
      // Reset form when dialog opens
      form.reset({
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
      });
    }
  }, [open, form]);

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
          <DialogTitle className="text-2xl font-semibold text-[#0485ea]">
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
              <EditFormContent 
                customers={customers}
                selectedCustomerAddress={selectedCustomerAddress}
                selectedCustomerName={selectedCustomerName}
                customerTab={customerTab}
                onNewCustomer={handleNewCustomer}
                onExistingCustomer={handleExistingCustomer}
                onPreview={handlePreview}
                onCancel={onClose}
              />
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
