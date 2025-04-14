import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useFormContext } from 'react-hook-form';
import { WorkOrderFormValues } from '../../WorkOrderFormSchema';

interface LocationStepProps {
  useCustomAddress: boolean;
  setUseCustomAddress: React.Dispatch<React.SetStateAction<boolean>>;
  locations: { location_id: string; location_name: string; address: string }[];
  customersLoading: boolean;
  locationsLoading: boolean;
}

const LocationStep: React.FC<LocationStepProps> = ({
  useCustomAddress,
  setUseCustomAddress,
  locations,
  customersLoading,
  locationsLoading,
}) => {
  const form = useFormContext<WorkOrderFormValues>();
  const [isExistingLocation, setIsExistingLocation] = useState(!useCustomAddress);

  // Set default state to California if none is provided
  useEffect(() => {
    if (useCustomAddress) {
      const currentState = form.getValues('state');
      if (!currentState) {
        form.setValue('state', 'California');
      }
    }
  }, [form, useCustomAddress]);

  // Handle radio selection change
  const handleLocationTypeChange = (value: string) => {
    const isExisting = value === 'existing';
    setIsExistingLocation(isExisting);
    setUseCustomAddress(!isExisting);

    // Clear irrelevant fields based on selection
    if (isExisting) {
      form.setValue('address', '');
      form.setValue('city', '');
      form.setValue('state', '');
      form.setValue('zip', '');
    } else {
      form.setValue('location_id', '');
      // Set default state
      form.setValue('state', 'California');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Work Order Location</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Select an existing location or enter a new address for this work order.
        </p>
      </div>

      <RadioGroup
        defaultValue={isExistingLocation ? 'existing' : 'custom'}
        onValueChange={handleLocationTypeChange}
        className="grid grid-cols-2 gap-4"
      >
        <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-slate-50">
          <RadioGroupItem value="existing" id="existing" />
          <Label htmlFor="existing" className="cursor-pointer">
            Use existing location
          </Label>
        </div>

        <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-slate-50">
          <RadioGroupItem value="custom" id="custom" />
          <Label htmlFor="custom" className="cursor-pointer">
            Enter custom address
          </Label>
        </div>
      </RadioGroup>

      {isExistingLocation ? (
        <FormField
          control={form.control}
          name="location_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Location</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={locationsLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {locations.map(location => (
                    <SelectItem key={location.location_id} value={location.location_id}>
                      {location.location_name || location.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
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
          </div>

          <FormField
            control={form.control}
            name="zip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zip Code</FormLabel>
                <FormControl>
                  <Input placeholder="Zip code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default LocationStep;
