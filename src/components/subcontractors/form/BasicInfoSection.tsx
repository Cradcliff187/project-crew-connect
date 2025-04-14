import React from 'react';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import SpecialtyMultiSelect from '../SpecialtyMultiSelect';
import { FormSectionProps } from '../types/formTypes';

const BasicInfoSection: React.FC<FormSectionProps> = ({ control }) => {
  return (
    <>
      <FormField
        control={control}
        name="subname"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Subcontractor Name *</FormLabel>
            <FormControl>
              <Input placeholder="Enter subcontractor name" {...field} required />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="contactemail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
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
      </div>

      <FormField
        control={control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Input placeholder="Street address" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <FormField
          control={control}
          name="city"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input placeholder="City" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Input placeholder="State" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="zip"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ZIP</FormLabel>
              <FormControl>
                <Input placeholder="ZIP code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="specialty_ids"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Specialties</FormLabel>
            <FormControl>
              <SpecialtyMultiSelect selectedSpecialties={field.value} onChange={field.onChange} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default BasicInfoSection;
