
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { SubcontractorFormData } from './types/formTypes';
import { useEffect } from 'react';

// Import form sections
import BasicInfoSection from './form/BasicInfoSection';
import FinancialSection from './form/FinancialSection';
import ComplianceSection from './form/ComplianceSection';
import PerformanceSection from './form/PerformanceSection';
import NotesAndStatusSection from './form/NotesAndStatusSection';

interface SubcontractorFormProps {
  onSubmit: (data: SubcontractorFormData) => void;
  isSubmitting: boolean;
  initialData?: Partial<SubcontractorFormData>;
  isEditing?: boolean;
}

const SubcontractorForm = ({ 
  onSubmit, 
  isSubmitting, 
  initialData, 
  isEditing = false 
}: SubcontractorFormProps) => {
  console.log('Form initialData:', initialData);
  
  const form = useForm<SubcontractorFormData>({
    defaultValues: {
      subid: initialData?.subid || undefined,
      subname: initialData?.subname || '',
      contactemail: initialData?.contactemail || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      zip: initialData?.zip || '',
      status: initialData?.status || 'PENDING',
      specialty_ids: initialData?.specialty_ids || [],
      payment_terms: initialData?.payment_terms || 'NET30',
      notes: initialData?.notes || '',
      // Additional vendor management fields
      insurance_expiration: initialData?.insurance_expiration || null,
      insurance_provider: initialData?.insurance_provider || '',
      insurance_policy_number: initialData?.insurance_policy_number || '',
      tax_id: initialData?.tax_id || '',
      hourly_rate: initialData?.hourly_rate || null,
      contract_on_file: initialData?.contract_on_file || false,
      contract_expiration: initialData?.contract_expiration || null,
      preferred: initialData?.preferred || false,
    }
  });
  
  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      console.log('Updating form with initialData:', initialData);
      
      // Reset the form with the new initial data
      form.reset({
        subid: initialData.subid,
        subname: initialData.subname || '',
        contactemail: initialData.contactemail || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        city: initialData.city || '',
        state: initialData.state || '',
        zip: initialData.zip || '',
        status: initialData.status || 'PENDING',
        specialty_ids: initialData.specialty_ids || [],
        payment_terms: initialData.payment_terms || 'NET30',
        notes: initialData.notes || '',
        insurance_expiration: initialData.insurance_expiration || null,
        insurance_provider: initialData.insurance_provider || '',
        insurance_policy_number: initialData.insurance_policy_number || '',
        tax_id: initialData.tax_id || '',
        hourly_rate: initialData.hourly_rate || null,
        contract_on_file: initialData.contract_on_file || false,
        contract_expiration: initialData.contract_expiration || null,
        preferred: initialData.preferred || false,
      });
    }
  }, [form, initialData]);

  const handleFormSubmit = (data: SubcontractorFormData) => {
    console.log('Form submitted with values:', data);
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form id="subcontractor-form" onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
        {/* Basic Information */}
        <BasicInfoSection control={form.control} />
        
        {/* Financial Information */}
        <FinancialSection control={form.control} />
        
        {/* Compliance Information */}
        <ComplianceSection control={form.control} />
        
        {/* Performance Information */}
        <PerformanceSection control={form.control} />
        
        {/* Notes and Status */}
        <NotesAndStatusSection control={form.control} />
      </form>
    </Form>
  );
};

export default SubcontractorForm;
