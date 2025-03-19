
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { SubcontractorFormData } from './types/formTypes';
import { useEffect } from 'react';

// Import form sections
import BasicInfoSection from './form/BasicInfoSection';
import FinancialSection from './form/FinancialSection';
import ComplianceSection from './form/ComplianceSection';
import PerformanceSection from './form/PerformanceSection';
import PerformanceMetricsSection from './form/PerformanceMetricsSection';
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
  
  // Log the initial data for debugging
  console.log('SubcontractorForm initialData:', initialData);
  
  // Ensure all incoming data has the right types
  const formattedInitialData = initialData ? {
    ...initialData,
    subid: initialData.subid ? String(initialData.subid) : undefined,
    rating: initialData.rating !== undefined ? Number(initialData.rating) : null,
    hourly_rate: initialData.hourly_rate !== undefined ? Number(initialData.hourly_rate) : null,
    on_time_percentage: initialData.on_time_percentage !== undefined ? Number(initialData.on_time_percentage) : null,
    quality_score: initialData.quality_score !== undefined ? Number(initialData.quality_score) : null,
    safety_incidents: initialData.safety_incidents !== undefined ? Number(initialData.safety_incidents) : null,
    response_time_hours: initialData.response_time_hours !== undefined ? Number(initialData.response_time_hours) : null,
  } : undefined;
  
  const form = useForm<SubcontractorFormData>({
    defaultValues: {
      subid: formattedInitialData?.subid || undefined,
      subname: formattedInitialData?.subname || '',
      contactemail: formattedInitialData?.contactemail || '',
      phone: formattedInitialData?.phone || '',
      address: formattedInitialData?.address || '',
      city: formattedInitialData?.city || '',
      state: formattedInitialData?.state || '',
      zip: formattedInitialData?.zip || '',
      status: formattedInitialData?.status || 'PENDING',
      specialty_ids: formattedInitialData?.specialty_ids || [],
      payment_terms: formattedInitialData?.payment_terms || 'NET30',
      notes: formattedInitialData?.notes || '',
      // Additional vendor management fields
      insurance_expiration: formattedInitialData?.insurance_expiration || null,
      insurance_provider: formattedInitialData?.insurance_provider || '',
      insurance_policy_number: formattedInitialData?.insurance_policy_number || '',
      tax_id: formattedInitialData?.tax_id || '',
      rating: formattedInitialData?.rating || null,
      hourly_rate: formattedInitialData?.hourly_rate || null,
      contract_on_file: formattedInitialData?.contract_on_file || false,
      contract_expiration: formattedInitialData?.contract_expiration || null,
      preferred: formattedInitialData?.preferred || false,
      last_performance_review: formattedInitialData?.last_performance_review || null,
      on_time_percentage: formattedInitialData?.on_time_percentage || null,
      quality_score: formattedInitialData?.quality_score || null,
      safety_incidents: formattedInitialData?.safety_incidents || null,
      response_time_hours: formattedInitialData?.response_time_hours || null,
    }
  });

  // Log values whenever form values change (for debugging)
  useEffect(() => {
    if (isEditing) {
      console.log('Current form values:', form.getValues());
    }
  }, [form, isEditing]);

  // Effect to update form if initialData changes (e.g., different subcontractor selected)
  useEffect(() => {
    if (initialData && isEditing) {
      console.log('Resetting form with updated initialData');
      form.reset({
        subid: String(initialData.subid || ''),
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
        // Additional vendor management fields
        insurance_expiration: initialData.insurance_expiration || null,
        insurance_provider: initialData.insurance_provider || '',
        insurance_policy_number: initialData.insurance_policy_number || '',
        tax_id: initialData.tax_id || '',
        rating: initialData.rating !== undefined ? Number(initialData.rating) : null,
        hourly_rate: initialData.hourly_rate !== undefined ? Number(initialData.hourly_rate) : null,
        contract_on_file: initialData.contract_on_file || false,
        contract_expiration: initialData.contract_expiration || null,
        preferred: initialData.preferred || false,
        last_performance_review: initialData.last_performance_review || null,
        on_time_percentage: initialData.on_time_percentage !== undefined ? Number(initialData.on_time_percentage) : null,
        quality_score: initialData.quality_score !== undefined ? Number(initialData.quality_score) : null,
        safety_incidents: initialData.safety_incidents !== undefined ? Number(initialData.safety_incidents) : null,
        response_time_hours: initialData.response_time_hours !== undefined ? Number(initialData.response_time_hours) : null,
      });
    }
  }, [initialData, form, isEditing]);

  return (
    <Form {...form}>
      <form id="subcontractor-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        {/* Basic Information */}
        <BasicInfoSection control={form.control} />
        
        {/* Financial Information */}
        <FinancialSection control={form.control} />
        
        {/* Compliance Information */}
        <ComplianceSection control={form.control} />
        
        {/* Performance Information */}
        <PerformanceSection control={form.control} />
        
        {/* Performance Metrics - Only show in edit mode */}
        {isEditing && (
          <PerformanceMetricsSection control={form.control} />
        )}
        
        {/* Notes and Status */}
        <NotesAndStatusSection control={form.control} />

        {/* Hidden field for subid when editing */}
        {isEditing && (
          <input type="hidden" {...form.register('subid')} />
        )}
      </form>
    </Form>
  );
};

export default SubcontractorForm;
