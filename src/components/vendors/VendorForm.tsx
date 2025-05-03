import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import React from 'react';
import { usePlacesAutocomplete, PlaceDetails } from '@/hooks/usePlacesAutocomplete';
import { parseAddressComponents, getFullStreetAddress } from '@/utils/addressUtils';

// Define vendor form data type
export interface VendorFormData {
  vendorid?: string;
  vendorname: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  status: string;
  // Financial information
  payment_terms?: string;
  tax_id?: string | null;
  // Notes
  notes?: string | null;
}

// Payment terms options
export const paymentTermsOptions = [
  { value: 'NET15', label: 'Net 15 Days' },
  { value: 'NET30', label: 'Net 30 Days' },
  { value: 'NET45', label: 'Net 45 Days' },
  { value: 'NET60', label: 'Net 60 Days' },
  { value: 'DUE_ON_RECEIPT', label: 'Due On Receipt' },
];

interface VendorFormProps {
  onSubmit: (data: VendorFormData) => void;
  isSubmitting: boolean;
  initialData?: Partial<VendorFormData>;
}

const VendorForm = ({ onSubmit, isSubmitting, initialData }: VendorFormProps) => {
  const isMobile = useIsMobile();

  const form = useForm<VendorFormData>({
    defaultValues: {
      vendorid: initialData?.vendorid || undefined,
      vendorname: initialData?.vendorname || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      zip: initialData?.zip || '',
      status: initialData?.status || 'ACTIVE',
      payment_terms: initialData?.payment_terms || 'NET30',
      tax_id: initialData?.tax_id || '',
      notes: initialData?.notes || '',
    },
  });

  const { setValue, watch } = form;

  const initialAddress = React.useRef(initialData?.address || '');

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
        console.log('VendorForm Place Details Received:', details);
        const parsed = parseAddressComponents(details.address_components);
        const fullStreet = getFullStreetAddress(parsed);

        setValue('address', details.formatted_address || fullStreet, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue('city', parsed.city, { shouldValidate: true, shouldDirty: true });
        setValue('state', parsed.state, { shouldValidate: true, shouldDirty: true });
        setValue('zip', parsed.postalCode, { shouldValidate: true, shouldDirty: true });
      } else {
        console.error('VendorForm: Failed to get place details.');
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
    <Form {...form}>
      <form id="vendor-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        {/* Basic Information */}
        <FormField
          control={form.control}
          name="vendorname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Vendor Name <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Enter vendor name" {...field} required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-4`}>
          <FormField
            control={form.control}
            name="email"
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
        </div>

        {/* Address Field with Autocomplete */}
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
                <div className="text-sm text-muted-foreground absolute top-full left-0 mt-1">
                  Loading...
                </div>
              )}
              {autocompleteError && (
                <div className="text-sm text-red-600 absolute top-full left-0 mt-1">
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

        {/* City, State, Zip Fields (readOnly or controlled by selection) */}
        <div
          className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-2 md:grid-cols-4 gap-4'}`}
        >
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem className={isMobile ? 'col-span-2' : 'col-span-2'}>
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

        {/* Financial Information */}
        <div className="pt-4 border-t">
          <h3 className="font-medium text-lg mb-4 text-[#0485ea]">Financial Information</h3>

          <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-4`}>
            <FormField
              control={form.control}
              name="payment_terms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Terms</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || 'NET30'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment terms" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentTermsOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tax_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax ID / EIN</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Tax identification number"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Status */}
        <div className="pt-4 border-t">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Status <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Additional notes about this vendor"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default VendorForm;
