
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { SubcontractorFormData } from './types/formTypes';

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
  
  // Ensure initialData.subid is a string if it exists
  const formattedInitialData = initialData ? {
    ...initialData,
    subid: initialData.subid ? String(initialData.subid) : undefined
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
      </form>
    </Form>
  );
};

export default SubcontractorForm;
