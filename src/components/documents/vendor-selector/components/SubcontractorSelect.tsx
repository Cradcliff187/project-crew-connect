
import React from 'react';
import { Control } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DocumentUploadFormValues } from '../../schemas/documentSchema';
import { SubcontractorBasic } from '../hooks/useVendorOptions';

interface SubcontractorSelectProps {
  control: Control<DocumentUploadFormValues>;
  subcontractors: SubcontractorBasic[];
  isLoading: boolean;
  onAddNewClick: () => void;
}

const SubcontractorSelect: React.FC<SubcontractorSelectProps> = ({
  control,
  subcontractors,
  isLoading,
  onAddNewClick
}) => {
  return (
    <FormField
      control={control}
      name="metadata.vendorId"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between">
            <FormLabel>Subcontractor</FormLabel>
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
                <SelectValue placeholder={isLoading ? "Loading..." : "Select subcontractor"} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {subcontractors.map(sub => (
                <SelectItem key={sub.subid} value={sub.subid}>
                  {sub.subname}
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

export default SubcontractorSelect;
