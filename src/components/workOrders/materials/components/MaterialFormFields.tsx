import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';
import FormSection from './FormSection';
import VendorDialog from './VendorDialog';
import { useFormContext, UseFormReturn } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { MaterialFormValues } from '../EnhancedAddMaterialForm';

interface MaterialFormFieldsProps {
  form: UseFormReturn<MaterialFormValues>;
  vendors: { vendorid: string; vendorname: string }[];
  onAddVendorClick: () => void;
  showVendorDialog: boolean;
  setShowVendorDialog: (value: boolean) => void;
  onVendorAdded: () => void;
}

const MaterialFormFields = ({
  form,
  vendors,
  onAddVendorClick,
  showVendorDialog,
  setShowVendorDialog,
  onVendorAdded,
}: MaterialFormFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="materialName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Material Name</FormLabel>
              <FormControl>
                <Input id="materialName" placeholder="Enter material name" {...field} required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vendorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex justify-between items-center">
                <span>
                  Vendor <span className="text-muted-foreground">(Optional)</span>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary h-auto p-0"
                  onClick={onAddVendorClick}
                >
                  <PlusCircle className="h-3.5 w-3.5 mr-1" />
                  Add New
                </Button>
              </FormLabel>
              <Select
                onValueChange={value => field.onChange(value === 'no-vendor' ? null : value)}
                value={field.value || ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="no-vendor">None</SelectItem>
                  {vendors.map(vendor => (
                    <SelectItem key={vendor.vendorid} value={vendor.vendorid}>
                      {vendor.vendorname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="1"
                  {...field}
                  onChange={e =>
                    field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))
                  }
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unitPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Price ($)</FormLabel>
              <FormControl>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={e =>
                    field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))
                  }
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <VendorDialog
        open={showVendorDialog}
        onOpenChange={setShowVendorDialog}
        onVendorAdded={onVendorAdded}
        isEditing={false}
      />
    </>
  );
};

export default MaterialFormFields;
