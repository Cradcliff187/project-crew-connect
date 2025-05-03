import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { WorkOrderFormValues } from '../WorkOrderFormSchema';
import React, { useRef, useEffect } from 'react';
import { usePlacesAutocomplete, PlaceDetails } from '@/hooks/usePlacesAutocomplete';
import { parseAddressComponents, getFullStreetAddress } from '@/utils/addressUtils';

interface CustomLocationFieldsProps {
  form: UseFormReturn<WorkOrderFormValues>;
}

const CustomLocationFields = ({ form }: CustomLocationFieldsProps) => {
  const { control, setValue, watch } = form;
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
      if (details) {
        console.log('WorkOrder CustomLocationFields Place Details Received:', details);
        const parsed = parseAddressComponents(details.address_components);
        const fullStreet = getFullStreetAddress(parsed);

        // Update all address-related fields
        setValue('address', details.formatted_address || fullStreet, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue('city', parsed.city, { shouldValidate: true, shouldDirty: true });
        setValue('state', parsed.state, { shouldValidate: true, shouldDirty: true });
        setValue('zip', parsed.postalCode, { shouldValidate: true, shouldDirty: true });
      } else {
        console.error('WorkOrder CustomLocationFields: Failed to get place details.');
        // Optionally clear related fields if details fetch fails
        setValue('city', '', { shouldValidate: true, shouldDirty: true });
        setValue('state', '', { shouldValidate: true, shouldDirty: true });
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
    if (currentAddressValue !== autocompleteInputValue) {
      setInputValueManual(currentAddressValue || '');
    }
  }, [currentAddressValue, autocompleteInputValue, setInputValueManual]);

  return (
    <>
      {/* Address Field with Autocomplete */}
      <FormField
        control={control}
        name="address"
        render={({ field }) => (
          <FormItem className="relative">
            <FormLabel>Address</FormLabel>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={control}
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
          control={control}
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

        <FormField
          control={control}
          name="zip"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ZIP</FormLabel>
              <FormControl>
                <Input placeholder="ZIP code" {...field} readOnly />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

export default CustomLocationFields;
