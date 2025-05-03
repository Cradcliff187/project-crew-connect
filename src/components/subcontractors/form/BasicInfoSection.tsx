import React, { useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import SpecialtyMultiSelect from '../SpecialtyMultiSelect';
import { FormSectionProps } from '../types/formTypes';
import { usePlacesAutocomplete, PlaceDetails } from '@/hooks/usePlacesAutocomplete';
import { parseAddressComponents, getFullStreetAddress } from '@/utils/addressUtils';
import { useFormContext } from 'react-hook-form';

const BasicInfoSection: React.FC<FormSectionProps> = ({ control }) => {
  const { setValue, watch } = useFormContext();
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
        console.log('Subcontractor Form Place Details Received:', details);
        // Parse the address components
        const parsed = parseAddressComponents(details.address_components);
        const fullStreet = getFullStreetAddress(parsed);

        // Update the address fields in the form
        setValue('address', details.formatted_address || fullStreet, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue('city', parsed.city, { shouldValidate: true, shouldDirty: true });
        setValue('state', parsed.state, { shouldValidate: true, shouldDirty: true });
        setValue('zip', parsed.postalCode, { shouldValidate: true, shouldDirty: true });
      } else {
        console.error('Subcontractor Form: Failed to get place details.');
        // Optionally clear fields on error
        setValue('city', '', { shouldValidate: true, shouldDirty: true });
        setValue('state', '', { shouldValidate: true, shouldDirty: true });
        setValue('zip', '', { shouldValidate: true, shouldDirty: true });
      }
    },
  });

  // Handle address input change for both hook and form control
  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleAutocompleteInputChange(e);
    setValue('address', e.target.value, { shouldDirty: true });
  };

  // Handle suggestion selection
  const handleSuggestionClick = (placeId: string) => {
    handleSelectSuggestion(placeId);
  };

  // Keep the autocomplete input in sync with the form value
  const currentAddressValue = watch('address');
  useEffect(() => {
    if (currentAddressValue !== autocompleteInputValue) {
      setInputValueManual(currentAddressValue || '');
    }
  }, [currentAddressValue, autocompleteInputValue, setInputValueManual]);

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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <FormField
          control={control}
          name="city"
          render={({ field }) => (
            <FormItem className="col-span-2">
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
