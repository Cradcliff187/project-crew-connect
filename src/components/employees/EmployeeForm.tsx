import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog'; // Assuming used in a dialog
import { Employee } from '@/types/common'; // Import Employee type
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Controller } from 'react-hook-form';

// Define Zod schema for validation
const employeeFormSchema = z.object({
  employee_id: z.string().uuid().optional(), // For edits
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  role: z.string().optional(),
  status: z.enum(['ACTIVE', 'TERMINATED']).default('ACTIVE'),
  cost_rate: z.number().nullable().optional(),
  bill_rate: z.number().nullable().optional(),
  // default_bill_rate is handled implicitly or via separate logic if needed
  // hourly_rate is likely deprecated but kept in DB schema for now
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

interface EmployeeFormProps {
  employeeToEdit?: Employee | null; // Pass employee data for editing
  onSuccess: () => void; // Callback after successful save
  onCancel: () => void; // Callback to close the form/dialog
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employeeToEdit, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      first_name: employeeToEdit?.firstName || '',
      last_name: employeeToEdit?.lastName || '',
      email: employeeToEdit?.email || '',
      phone: employeeToEdit?.phone || '',
      role: employeeToEdit?.role || '',
      status: employeeToEdit?.status === 'TERMINATED' ? 'TERMINATED' : 'ACTIVE', // Map status
      cost_rate: employeeToEdit?.cost_rate || null,
      bill_rate: employeeToEdit?.bill_rate || null,
      // employee_id is only needed for updates, handled in onSubmit
    },
  });

  const onSubmit: SubmitHandler<EmployeeFormValues> = async data => {
    setIsSaving(true);
    try {
      // Map form values to database column names
      const upsertData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || null,
        phone: data.phone || null,
        role: data.role || null,
        status: data.status,
        cost_rate: data.cost_rate, // Already number | null
        bill_rate: data.bill_rate, // Already number | null
        // Pass employee_id ONLY if we are editing
        ...(employeeToEdit && { employee_id: employeeToEdit.id }),
      };

      // Remove undefined keys explicitly if needed by upsert, though Supabase often handles this
      // Object.keys(upsertData).forEach(key => upsertData[key] === undefined && delete upsertData[key]);

      console.log('Upserting employee data:', upsertData);

      const { error } = await supabase.from('employees').upsert(upsertData);

      if (error) throw error;

      toast({
        title: employeeToEdit ? 'Employee Updated' : 'Employee Created',
        description: `${data.first_name} ${data.last_name} has been saved.`,
      });
      onSuccess(); // Call success callback (e.g., close dialog, refresh list)
    } catch (error: any) {
      console.error('Error saving employee:', error);
      toast({
        title: 'Save Failed',
        description: error.message || 'Could not save employee details.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    // Using FormProvider for potential nested field components later
    // <FormProvider {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Basic Info Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="first_name">
            First Name <span className="text-red-500">*</span>
          </Label>
          <Input id="first_name" {...form.register('first_name')} />
          {form.formState.errors.first_name && (
            <p className="text-sm text-red-500">{form.formState.errors.first_name.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="last_name">
            Last Name <span className="text-red-500">*</span>
          </Label>
          <Input id="last_name" {...form.register('last_name')} />
          {form.formState.errors.last_name && (
            <p className="text-sm text-red-500">{form.formState.errors.last_name.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register('email')} />
          {form.formState.errors.email && (
            <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...form.register('phone')} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="role">Role</Label>
          <Input id="role" {...form.register('role')} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="status">
            Status <span className="text-red-500">*</span>
          </Label>
          {/* Use Controller for Shadcn Select with react-hook-form */}
          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="TERMINATED">Terminated</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {/* Rate Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
        <div className="space-y-1">
          <Label htmlFor="cost_rate">Cost Rate ($/hr)</Label>
          <Input
            id="cost_rate"
            type="number"
            step="0.01"
            {...form.register('cost_rate', { setValueAs: v => (v === '' ? null : parseFloat(v)) })}
            placeholder="e.g., 55.00"
          />
          {form.formState.errors.cost_rate && (
            <p className="text-sm text-red-500">{form.formState.errors.cost_rate.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="bill_rate">Bill Rate ($/hr)</Label>
          <Input
            id="bill_rate"
            type="number"
            step="0.01"
            {...form.register('bill_rate', { setValueAs: v => (v === '' ? null : parseFloat(v)) })}
            placeholder="e.g., 75.00"
          />
          {form.formState.errors.bill_rate && (
            <p className="text-sm text-red-500">{form.formState.errors.bill_rate.message}</p>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving} className="bg-[#0485ea] hover:bg-[#0373ce]">
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {employeeToEdit ? 'Save Changes' : 'Create Employee'}
        </Button>
      </DialogFooter>
    </form>
    // </FormProvider>
  );
};

export default EmployeeForm;
