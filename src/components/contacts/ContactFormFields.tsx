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
import { usePlacesAutocomplete, PlaceDetails } from '@/hooks/usePlacesAutocomplete';
import { parseAddressComponents, getFullStreetAddress } from '@/utils/addressUtils';

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
  const { watch, setValue } = useFormContext<Contact>();

  const currentStatus = watch('status');

  const initialAddressValue = React.useRef(form.getValues('address') || '');

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
    initialValue: initialAddressValue.current,
    onSelect: details => {
      if (details) {
        console.log('Contact Form Place Details Received:', details);

        // Parse address components
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
        console.error('Contact Form: Failed to get place details.');
        // Optionally clear fields on error
        setValue('city', '', { shouldValidate: true, shouldDirty: true });
        setValue('state', '', { shouldValidate: true, shouldDirty: true });
        setValue('zip', '', { shouldValidate: true, shouldDirty: true });
      }
    },
  });

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleAutocompleteInputChange(e);
    setValue('address', e.target.value, { shouldDirty: true });
  };

  const handleSuggestionClick = (placeId: string) => {
    handleSelectSuggestion(placeId);
  };

  const currentAddressValue = watch('address');
  React.useEffect(() => {
    if (currentAddressValue !== autocompleteInputValue) {
      setInputValueManual(currentAddressValue || '');
    }
  }, [currentAddressValue, autocompleteInputValue, setInputValueManual]);

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

      {/* Address section with city, state, zip */}
      <div className="space-y-4">
        <FormField
          control={form.control}
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

        <div className="grid grid-cols-3 gap-4">
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

          <FormField
            control={form.control}
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
      </div>

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
