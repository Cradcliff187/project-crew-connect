
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
      rating: initialData?.rating || null,
      hourly_rate: initialData?.hourly_rate || null,
      contract_on_file: initialData?.contract_on_file || false,
      contract_expiration: initialData?.contract_expiration || null,
      preferred: initialData?.preferred || false,
      last_performance_review: initialData?.last_performance_review || null,
      on_time_percentage: initialData?.on_time_percentage || null,
      quality_score: initialData?.quality_score || null,
      safety_incidents: initialData?.safety_incidents || null,
      response_time_hours: initialData?.response_time_hours || null,
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
