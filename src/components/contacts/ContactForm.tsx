
import { useState } from 'react';
import { X } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import ContactFormFields from './ContactFormFields';
import { ContactFormData } from '@/pages/Contacts';

// Define form schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(5, {
    message: "Please enter a valid phone number.",
  }),
  company: z.string().optional(),
  role: z.string().optional(),
  type: z.enum(['client', 'subcontractor', 'supplier', 'customer', 'employee']),
  status: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  specialty: z.string().optional(),
  hourlyRate: z.string().optional(),
  materials: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ContactFormProps {
  initialData?: Partial<FormData & { id?: string }>;
  onSubmit: (data: ContactFormData) => void;
  onCancel: () => void;
}

const getDefaultStatus = (type: string) => {
  switch (type) {
    case 'client':
    case 'customer':
      return 'PROSPECT';
    case 'supplier':
      return 'POTENTIAL';
    case 'subcontractor':
      return 'PENDING';
    case 'employee':
      return 'ACTIVE';
    default:
      return '';
  }
};

const ContactForm = ({ initialData, onSubmit, onCancel }: ContactFormProps) => {
  const [contactType, setContactType] = useState(initialData?.type || 'client');
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      company: initialData?.company || '',
      role: initialData?.role || '',
      type: initialData?.type || 'client',
      status: initialData?.status || getDefaultStatus(initialData?.type || 'client'),
      address: initialData?.address || '',
      notes: initialData?.notes || '',
      specialty: initialData?.specialty || '',
      hourlyRate: initialData?.hourlyRate || '',
      materials: initialData?.materials || '',
      rating: initialData?.rating || undefined,
    },
  });

  const handleSubmit = (data: FormData) => {
    // Ensure required fields for ContactFormData are present
    const contactData: ContactFormData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      type: data.type,
      company: data.company,
      role: data.role,
      status: data.status,
      address: data.address,
      notes: data.notes,
      specialty: data.specialty,
      hourlyRate: data.hourlyRate,
      materials: data.materials,
      rating: data.rating
    };
    
    onSubmit(contactData);
  };
  
  const handleTypeChange = (value: string) => {
    if (value === 'employee' || value === 'subcontractor' || value === 'supplier' || value === 'client' || value === 'customer') {
      setContactType(value);
      form.setValue('type', value);
      
      // Set default status when type changes (only if creating new contact)
      if (!initialData?.id) {
        form.setValue('status', getDefaultStatus(value));
      }
    }
  };

  const getStatusOptions = () => {
    switch (contactType) {
      case 'client':
      case 'customer':
        return [
          { value: 'PROSPECT', label: 'Prospect' },
          { value: 'ACTIVE', label: 'Active' },
          { value: 'INACTIVE', label: 'Inactive' }
        ];
      case 'supplier':
        return [
          { value: 'POTENTIAL', label: 'Potential' },
          { value: 'APPROVED', label: 'Approved' },
          { value: 'INACTIVE', label: 'Inactive' }
        ];
      case 'subcontractor':
        return [
          { value: 'PENDING', label: 'Pending' },
          { value: 'QUALIFIED', label: 'Qualified' },
          { value: 'ACTIVE', label: 'Active' },
          { value: 'INACTIVE', label: 'Inactive' }
        ];
      case 'employee':
        return [
          { value: 'ACTIVE', label: 'Active' },
          { value: 'INACTIVE', label: 'Inactive' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-xl font-medium">
          {initialData ? 'Edit Contact' : 'Add New Contact'}
        </h2>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <ContactFormFields 
              form={form} 
              contactType={contactType}
              getStatusOptions={getStatusOptions}
              handleTypeChange={handleTypeChange}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#0485ea] hover:bg-[#0375d1]">
                {initialData ? 'Save Changes' : 'Add Contact'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ContactForm;
