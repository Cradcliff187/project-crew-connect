import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import StatusBadge from '@/components/common/status/StatusBadge';
import { ContactFormData } from '@/pages/Contacts';
import { useFormContext } from 'react-hook-form';
import { Contact } from '@/pages/Contacts';
import { StatusType } from '@/types/common';

interface ContactFormFieldsProps {
  form: UseFormReturn<any>;
  contactType: string;
  getStatusOptions: () => { value: string; label: string }[];
  handleTypeChange: (value: string) => void;
}

const ContactFormFields = ({
  form,
  contactType,
  getStatusOptions,
  handleTypeChange,
}: ContactFormFieldsProps) => {
  const { watch } = useFormContext<Contact>();

  const currentStatus = watch('status');

  return (
    <div className="space-y-6">
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
              <Select onValueChange={value => handleTypeChange(value)} defaultValue={field.value}>
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
              <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status">
                      {field.value && (
                        <div className="flex items-center">
                          <StatusBadge status={field.value.toLowerCase() as any} size="sm" />
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {getStatusOptions().map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center">
                        <StatusBadge status={option.value.toLowerCase() as any} size="sm" />
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
                  <Input type="number" placeholder="0.00" step="0.01" min="0" {...field} />
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
                <FormLabel>{contactType === 'supplier' ? 'Supply Type' : 'Specialty'}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      contactType === 'supplier'
                        ? 'e.g., Lumber, Electrical, Plumbing'
                        : 'e.g., Framing, Electrical, Plumbing'
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
                  onValueChange={value => field.onChange(parseInt(value))}
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
    </div>
  );
};

export default ContactFormFields;
