import React, { useState, useEffect, useRef } from 'react';
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
import { usePlacesAutocomplete, PlaceDetails } from '@/hooks/usePlacesAutocomplete';
import { parseAddressComponents, getFullStreetAddress } from '@/utils/addressUtils';

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
  const { setValue, watch, getValues } = form;
  const initialAddress = useRef(watch('address') || '');

  // Set up Places Autocomplete hook
  const {
    inputValue: autocompleteInputValue,
    suggestions,
    loading: autocompleteLoading,
    error: autocompleteError,
    handleInputChange: handleAutocompleteInputChange,
    handleSelectSuggestion,
    clearSuggestions,
    setInputValueManual,
  } = usePlacesAutocomplete({
    initialValue: initialAddress.current,
    onSelect: details => {
      if (details && !isExistingLocation) {
        console.log('LocationStep Place Details Received:', details);
        const parsed = parseAddressComponents(details.address_components);
        const fullStreet = getFullStreetAddress(parsed);

        // Update all address-related fields
        setValue('address', details.formatted_address || fullStreet, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue('city', parsed.city, { shouldValidate: true, shouldDirty: true });
        setValue('state', parsed.state || 'California', {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue('zip', parsed.postalCode, { shouldValidate: true, shouldDirty: true });
      } else if (!isExistingLocation) {
        console.error('LocationStep: Failed to get place details.');
        // Clear fields on error, but keep default state
        setValue('city', '', { shouldValidate: true, shouldDirty: true });
        setValue('state', 'California', { shouldValidate: true, shouldDirty: true });
        setValue('zip', '', { shouldValidate: true, shouldDirty: true });
      }
    },
  });

  // Handle address input change
  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleAutocompleteInputChange(e);
    setValue('address', e.target.value, { shouldDirty: true });
  };

  // Handle suggestion selection
  const handleSuggestionClick = (placeId: string) => {
    handleSelectSuggestion(placeId);
  };

  // Keep autocomplete input in sync with form value
  const currentAddressValue = watch('address');
  useEffect(() => {
    if (!isExistingLocation && currentAddressValue !== autocompleteInputValue) {
      setInputValueManual(currentAddressValue || '');
    }
  }, [currentAddressValue, autocompleteInputValue, setInputValueManual, isExistingLocation]);

  // Set default state to California if none is provided
  useEffect(() => {
    if (useCustomAddress) {
      const currentState = getValues('state');
      if (!currentState) {
        setValue('state', 'California');
      }
    }
  }, [getValues, setValue, useCustomAddress]);

  // Handle radio selection change
  const handleLocationTypeChange = (value: string) => {
    const isExisting = value === 'existing';
    setIsExistingLocation(isExisting);
    setUseCustomAddress(!isExisting);

    // Clear irrelevant fields based on selection
    if (isExisting) {
      setValue('address', '');
      setValue('city', '');
      setValue('state', '');
      setValue('zip', '');
      clearSuggestions();
    } else {
      setValue('location_id', '');
      // Set default state
      setValue('state', 'California');
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
          {/* Address Field with Autocomplete */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Start typing address..."
                    {...field}
                    value={autocompleteInputValue}
                    onChange={handleAddressInputChange}
                    onBlur={() => setTimeout(clearSuggestions, 150)}
                  />
                </FormControl>
                {autocompleteLoading && (
                  <div className="text-sm text-muted-foreground absolute top-full left-0 mt-1 z-10">
                    Loading...
                  </div>
                )}
                {autocompleteError && (
                  <div className="text-sm text-red-600 absolute top-full left-0 mt-1 z-10">
                    {autocompleteError}
                  </div>
                )}
                {suggestions.length > 0 && (
                  <ul className="absolute z-10 w-full bg-background border border-border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {suggestions.map(suggestion => (
                      <li
                        key={suggestion.place_id}
                        className="px-3 py-2 cursor-pointer hover:bg-accent"
                        onMouseDown={() => handleSuggestionClick(suggestion.place_id)}
                      >
                        {suggestion.description}
                      </li>
                    ))}
                  </ul>
                )}
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
                    <Input placeholder="City" {...field} readOnly />
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
                    <Input placeholder="State" {...field} readOnly />
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
                  <Input placeholder="Zip code" {...field} readOnly />
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
