
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Import custom components
import EstimatePreview from './components/EstimatePreview';
import EstimateFormButtons from './components/EstimateFormButtons';
import { useEstimateSubmit } from './hooks/useEstimateSubmit';
import { useEstimateFormData } from './hooks/useEstimateFormData';
import { useEstimateFormState } from './hooks/useEstimateFormState';
import EstimateFormHeader from './components/EstimateFormHeader';
import EditFormContent from './components/form-steps/EditFormContent';

interface EstimateFormProps {
  open: boolean;
  onClose: () => void;
}

const EstimateForm = ({ open, onClose }: EstimateFormProps) => {
  const [step, setStep] = useState<'edit' | 'preview'>('edit');
  const { isSubmitting, submitEstimate } = useEstimateSubmit();
  
  // Use custom hook for form state management
  const { 
    form, 
    resetForm, 
    handleNewCustomer, 
    handleExistingCustomer,
    customerTab
  } = useEstimateFormState(open);
  
  // Use custom hook for form data fetching
  const { 
    customers, 
    selectedCustomerAddress, 
    selectedCustomerName 
  } = useEstimateFormData({ open, customerId: form.watch('customer'), isNewCustomer: form.watch('isNewCustomer') });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setStep('edit');
      resetForm();
    }
  }, [open, resetForm]);

  // Handle form submission
  const onSubmit = async (data: any) => {
    await submitEstimate(data, customers, onClose);
  };

  // Handle preview with proper type
  const handlePreview = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const isValid = await form.trigger();
    if (isValid) {
      setStep('preview');
    }
  };

  const handleBackToEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setStep('edit');
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0" aria-describedby="estimate-form-description">
        {/* Add hidden DialogTitle and DialogDescription for accessibility */}
        <DialogTitle className="sr-only">Create New Estimate</DialogTitle>
        <DialogDescription id="estimate-form-description" className="sr-only">
          Form for creating a new estimate with project details, customer information, and line items.
        </DialogDescription>
        
        <EstimateFormHeader 
          step={step}
          onBackToEdit={handleBackToEdit}
        />

        <Form {...form}>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              if (step === 'preview') {
                form.handleSubmit(onSubmit)(e);
              }
            }} 
            className="space-y-6 px-6 pb-6"
          >
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
