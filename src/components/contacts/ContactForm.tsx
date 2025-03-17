
import { useState } from 'react';
import { X } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import StatusBadge from '@/components/ui/StatusBadge';

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
  initialData?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
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
    onSubmit(data);
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

  // Define status options based on contact type
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Type</FormLabel>
                    <Select 
                      onValueChange={(value) => handleTypeChange(value)} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contact type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="supplier">Supplier</SelectItem>
                        <SelectItem value="subcontractor">Subcontractor</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status">
                            {field.value && (
                              <div className="flex items-center">
                                <StatusBadge 
                                  status={field.value.toLowerCase() as any} 
                                  size="sm" 
                                />
                              </div>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getStatusOptions().map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center">
                              <StatusBadge 
                                status={option.value.toLowerCase() as any} 
                                size="sm" 
                              />
                              <span className="ml-2">{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {contactType !== 'employee' && (
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input placeholder="Job title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(contactType === 'subcontractor' || contactType === 'employee') && (
                <FormField
                  control={form.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          step="0.01" 
                          min="0"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {(contactType === 'supplier' || contactType === 'subcontractor') && (
                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {contactType === 'supplier' ? 'Supply Type' : 'Specialty'}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={
                            contactType === 'supplier' 
                              ? "e.g., Lumber, Electrical, Plumbing" 
                              : "e.g., Framing, Electrical, Plumbing"
                          } 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating (1-5)</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">★ Poor</SelectItem>
                          <SelectItem value="2">★★ Fair</SelectItem>
                          <SelectItem value="3">★★★ Good</SelectItem>
                          <SelectItem value="4">★★★★ Very Good</SelectItem>
                          <SelectItem value="5">★★★★★ Excellent</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St, Anytown, CA 12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {contactType === 'supplier' && (
              <FormField
                control={form.control}
                name="materials"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Materials/Products</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List materials or products this supplier provides" 
                        className="resize-none h-24"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional information about this contact" 
                      className="resize-none h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
