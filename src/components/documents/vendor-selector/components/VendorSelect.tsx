import React from 'react';
import { Control, useController } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DocumentUploadFormValues } from '../../schemas/documentSchema';
import { Vendor } from '../hooks/useVendorOptions';

interface VendorSelectProps {
  control: Control<DocumentUploadFormValues>;
  vendors: Vendor[];
  isLoading: boolean;
  onAddNewClick: () => void;
}

const VendorSelect: React.FC<VendorSelectProps> = ({
  control,
  vendors,
  isLoading,
  onAddNewClick,
}) => {
  return (
    <FormField
      control={control}
      name="metadata.vendorId"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between">
            <FormLabel>Vendor</FormLabel>
            <button
              type="button"
              className="text-xs text-[#0485ea] hover:text-[#0375d1] flex items-center"
              onClick={onAddNewClick}
            >
              <span className="mr-1">+</span> Add New
            </button>
          </div>

          <Select value={field.value} onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? 'Loading...' : 'Select vendor'} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
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
  );
};

export default VendorSelect;
