import React, { useState, useEffect } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import CustomerForm from '../CustomerForm'; // Reuse CustomerForm
import { usePlacesAutocomplete, PlaceDetails } from '@/hooks/usePlacesAutocomplete'; // Import hook
import { parseAddressComponents, getFullStreetAddress } from '@/utils/addressUtils'; // Import utils

// Define Zod schema for this step's validation
// Based on projectFormSchema but tailored for this step
const step1Schema = z
  .object({
    projectName: z.string().min(1, { message: 'Project name is required' }),
    customerId: z.string().optional(),
    siteLocationSameAsCustomer: z.boolean().default(true),
    siteLocation: z.object({
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
    }),
    newCustomer: z.object({
      customerName: z.string().optional(),
      email: z.string().email().optional().or(z.literal('')),
      phone: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
    }),
  })
  .refine(
    data => {
      // Either customerId is provided OR customerName is provided
      return !!data.customerId || !!data.newCustomer.customerName;
    },
    {
      message: 'Either select an existing customer or provide a name for a new customer',
      path: ['newCustomer.customerName'], // Point error to new customer name if neither is filled
    }
  )
  .refine(
    data => {
      // If site location is different, address is required
      if (!data.siteLocationSameAsCustomer) {
        return !!data.siteLocation.address;
      }
      return true;
    },
    {
      message: 'Site address is required if different from customer address',
      path: ['siteLocation.address'],
    }
  );

export type Step1FormValues = z.infer<typeof step1Schema>;

interface Step1Props {
  formData: Partial<Step1FormValues>;
  onNext: (data: Step1FormValues) => void;
  wizardFormActions: {
    triggerSubmit: () => void;
  };
}

const Step1_ProjectCustomerInfo: React.FC<Step1Props> = ({
  formData,
  onNext,
  wizardFormActions,
}) => {
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [customerTab, setCustomerTab] = useState<'existing' | 'new'>(
    formData.customerId && !formData.newCustomer?.customerName ? 'existing' : 'new'
  );
  const [useDifferentSiteLocation, setUseDifferentSiteLocation] = useState(
    formData.siteLocationSameAsCustomer === false
  );

  const form = useForm<Step1FormValues>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      projectName: formData.projectName || '',
      customerId: customerTab === 'existing' ? formData.customerId || '' : '',
      siteLocationSameAsCustomer: formData.siteLocationSameAsCustomer !== false,
      siteLocation: {
        address: formData.siteLocation?.address || '',
        city: formData.siteLocation?.city || '',
        state: formData.siteLocation?.state || '',
        zip: formData.siteLocation?.zip || '',
      },
      newCustomer:
        customerTab === 'new'
          ? formData.newCustomer || {
              customerName: '',
              email: '',
              phone: '',
              address: '',
              city: '',
              state: '',
              zip: '',
            }
          : {
              customerName: '',
              email: '',
              phone: '',
              address: '',
              city: '',
              state: '',
              zip: '',
            },
    },
  });

  const { setValue, watch, trigger } = form; // Get setValue, watch, trigger

  // --- Autocomplete Hook Setup (for siteLocation) ---
  const initialSiteAddress = React.useRef(formData.siteLocation?.address || '');

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
    initialValue: initialSiteAddress.current,
    onSelect: details => {
      // Only update if custom site location is active
      if (details && useDifferentSiteLocation) {
        console.log('Project Step1 Site Location Details Received:', details);
        const parsed = parseAddressComponents(details.address_components);
        const fullStreet = getFullStreetAddress(parsed);

        // Update react-hook-form fields
        setValue('siteLocation.address', details.formatted_address || fullStreet, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue('siteLocation.city', parsed.city, { shouldValidate: true, shouldDirty: true });
        setValue('siteLocation.state', parsed.state, { shouldValidate: true, shouldDirty: true });
        setValue('siteLocation.zip', parsed.postalCode, {
          shouldValidate: true,
          shouldDirty: true,
        });
        // Trigger validation after setting multiple fields if needed
        trigger(['siteLocation.city', 'siteLocation.state', 'siteLocation.zip']);
      } else if (useDifferentSiteLocation) {
        console.error('Project Step1: Failed to get site location details.');
        // Optionally clear related fields if details fetch fails
        setValue('siteLocation.city', '', { shouldValidate: true, shouldDirty: true });
        setValue('siteLocation.state', '', { shouldValidate: true, shouldDirty: true });
        setValue('siteLocation.zip', '', { shouldValidate: true, shouldDirty: true });
      }
    },
  });

  // Handle site address input change for both hook and react-hook-form
  const handleSiteAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleAutocompleteInputChange(e); // Update hook's internal state
    setValue('siteLocation.address', e.target.value, { shouldDirty: true }); // Update RHF state
  };

  // Handle selecting a suggestion
  const handleSiteSuggestionClick = (placeId: string) => {
    handleSelectSuggestion(placeId); // Trigger details fetch via hook
  };

  // Sync hook input value if form value changes externally (e.g., reset, toggle)
  const currentSiteAddressValue = watch('siteLocation.address');
  React.useEffect(() => {
    // Only sync if different site location is active and the value differs
    if (useDifferentSiteLocation && currentSiteAddressValue !== autocompleteInputValue) {
      setInputValueManual(currentSiteAddressValue || '');
    }
    // If switching away from different site location, clear the hook's input/suggestions
    if (!useDifferentSiteLocation && autocompleteInputValue) {
      setInputValueManual('');
      clearSuggestions();
    }
  }, [
    useDifferentSiteLocation,
    currentSiteAddressValue,
    autocompleteInputValue,
    setInputValueManual,
    clearSuggestions,
  ]);
  // --- End Autocomplete Hook Setup ---

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('customerid, customername')
          .order('customername');

        if (error) throw error;
        setCustomers(data?.map(c => ({ id: c.customerid, name: c.customername || '' })) || []);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
    fetchCustomers();
  }, []);

  // Update form value when checkbox changes
  useEffect(() => {
    form.setValue('siteLocationSameAsCustomer', !useDifferentSiteLocation);
  }, [useDifferentSiteLocation, form]);

  // Link wizard button to this form's submit handler
  useEffect(() => {
    wizardFormActions.triggerSubmit = form.handleSubmit(onNext);
  }, [form, onNext, wizardFormActions]);

  const handleSwitchToNew = () => {
    if (customerTab !== 'new') {
      setCustomerTab('new');
      form.setValue('customerId', '');
    }
  };

  const handleSwitchToExisting = () => {
    if (customerTab !== 'existing') {
      setCustomerTab('existing');
      form.setValue('newCustomer', {
        customerName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
      });
      form.clearErrors('newCustomer.customerName');
    }
  };

  return (
    <Form {...form}>
      <form id="step1-form" onSubmit={form.handleSubmit(onNext)} className="space-y-6">
        <FormField
          control={form.control}
          name="projectName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name*</FormLabel>
              <FormControl>
                <Input placeholder="Enter project name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 p-4 border rounded-md">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Customer Information</h3>
            {customerTab === 'existing' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSwitchToNew}
                className="text-[#0485ea] border-[#0485ea]/50 hover:bg-[#0485ea]/10"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add New Customer
              </Button>
            )}
          </div>

          <Tabs
            value={customerTab}
            onValueChange={value => {
              if (value === 'existing') handleSwitchToExisting();
              else handleSwitchToNew();
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing">Existing Customer</TabsTrigger>
              <TabsTrigger value="new">New Customer</TabsTrigger>
            </TabsList>
            <TabsContent value="existing" className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Customer*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      disabled={customerTab === 'new'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an existing customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map(customer => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            <TabsContent value="new" className="space-y-4 pt-4">
              <CustomerForm form={form as UseFormReturn<any>} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4 p-4 border rounded-md">
          <h3 className="text-lg font-medium mb-2">Site Location</h3>
          <FormField
            control={form.control}
            name="siteLocationSameAsCustomer"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={checked => {
                      const isChecked = Boolean(checked);
                      field.onChange(isChecked);
                      setUseDifferentSiteLocation(!isChecked);
                      if (isChecked) {
                        // If same as customer, clear site location fields
                        setValue('siteLocation.address', '');
                        setValue('siteLocation.city', '');
                        setValue('siteLocation.state', '');
                        setValue('siteLocation.zip', '');
                        setInputValueManual(''); // Clear autocomplete input too
                      }
                    }}
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  Site location is the same as customer address
                </FormLabel>
              </FormItem>
            )}
          />

          {useDifferentSiteLocation && (
            <div className="space-y-4 pt-4 border-t mt-4">
              <p className="text-sm text-muted-foreground">Enter the site address:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Site Address Field with Autocomplete */}
                <FormField
                  control={form.control}
                  name="siteLocation.address"
                  render={({ field }) => (
                    <FormItem className="relative">
                      {' '}
                      {/* Add relative positioning */}
                      <FormLabel>Address*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Start typing address..."
                          {...field} // Spread RHF props
                          value={autocompleteInputValue} // Control value via hook
                          onChange={handleSiteAddressInputChange} // Use combined handler
                          onBlur={() => setTimeout(clearSuggestions, 150)} // Hide suggestions
                          disabled={!useDifferentSiteLocation} // Ensure disabled state works
                        />
                      </FormControl>
                      {/* Suggestions Dropdown */}
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
                              onMouseDown={() => handleSiteSuggestionClick(suggestion.place_id)}
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
                {/* City Field */}
                <FormField
                  control={form.control}
                  name="siteLocation.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="City"
                          {...field}
                          readOnly
                          disabled={!useDifferentSiteLocation}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* State Field */}
                <FormField
                  control={form.control}
                  name="siteLocation.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="State"
                          {...field}
                          readOnly
                          disabled={!useDifferentSiteLocation}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Zip Field */}
                <FormField
                  control={form.control}
                  name="siteLocation.zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Zip Code"
                          {...field}
                          readOnly
                          disabled={!useDifferentSiteLocation}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
        </div>

        <button type="submit" style={{ display: 'none' }} aria-hidden="true"></button>
      </form>
    </Form>
  );
};

export default Step1_ProjectCustomerInfo;
