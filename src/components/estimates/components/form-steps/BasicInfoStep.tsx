import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import { Loader2, Info, MapPin, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import React, { useRef, useEffect } from 'react';
import { usePlacesAutocomplete, PlaceDetails } from '@/hooks/usePlacesAutocomplete';
import { parseAddressComponents, getFullStreetAddress } from '@/utils/addressUtils';

interface BasicInfoStepProps {
  customerTab: 'existing' | 'new';
  onNewCustomer: () => void;
  onExistingCustomer: () => void;
  selectedCustomerAddress: string | null;
  customers: {
    id: string;
    name: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  }[];
  loading: boolean;
}

const BasicInfoStep = ({
  customerTab,
  onNewCustomer,
  onExistingCustomer,
  selectedCustomerAddress,
  customers,
  loading,
}: BasicInfoStepProps) => {
  const form = useFormContext<EstimateFormValues>();
  const showSiteLocation = form.watch('showSiteLocation');
  const { setValue, watch } = form;

  // Find the currently selected customer to display their address
  const selectedCustomerId = form.watch('customer');
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const customerAddress = selectedCustomer
    ? `${selectedCustomer.address || ''} ${selectedCustomer.city || ''} ${selectedCustomer.state || ''} ${selectedCustomer.zip || ''}`.trim()
    : null;

  const hasCustomerAddress = !!customerAddress && customerAddress.length > 0;

  // --- Customer Address Autocomplete ---
  const initialCustomerAddress = useRef(watch('newCustomer.address') || '');

  const {
    inputValue: customerAddressInputValue,
    suggestions: customerAddressSuggestions,
    loading: customerAddressLoading,
    error: customerAddressError,
    handleInputChange: handleCustomerAddressChange,
    handleSelectSuggestion: handleCustomerAddressSelect,
    clearSuggestions: clearCustomerSuggestions,
    setInputValueManual: setCustomerInputValue,
  } = usePlacesAutocomplete({
    initialValue: initialCustomerAddress.current,
    onSelect: details => {
      if (details) {
        console.log('Estimate BasicInfoStep - Customer Address Details:', details);
        const parsed = parseAddressComponents(details.address_components);
        const fullStreet = getFullStreetAddress(parsed);

        // Update customer address fields
        setValue('newCustomer.address', details.formatted_address || fullStreet, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue('newCustomer.city', parsed.city, { shouldValidate: true, shouldDirty: true });
        setValue('newCustomer.state', parsed.state, { shouldValidate: true, shouldDirty: true });
        setValue('newCustomer.zip', parsed.postalCode, { shouldValidate: true, shouldDirty: true });
      } else {
        console.error('Estimate BasicInfoStep: Failed to get customer address details');
        // Clear fields on error
        setValue('newCustomer.city', '', { shouldValidate: true, shouldDirty: true });
        setValue('newCustomer.state', '', { shouldValidate: true, shouldDirty: true });
        setValue('newCustomer.zip', '', { shouldValidate: true, shouldDirty: true });
      }
    },
  });

  // Handle customer address input change
  const handleCustomerAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleCustomerAddressChange(e);
    setValue('newCustomer.address', e.target.value, { shouldDirty: true });
  };

  // Keep customer address input synchronized
  const currentCustomerAddressValue = watch('newCustomer.address');
  useEffect(() => {
    if (currentCustomerAddressValue !== customerAddressInputValue) {
      setCustomerInputValue(currentCustomerAddressValue || '');
    }
  }, [currentCustomerAddressValue, customerAddressInputValue, setCustomerInputValue]);

  // --- Site Location Autocomplete ---
  const initialSiteAddress = useRef(watch('location.address') || '');

  const {
    inputValue: siteAddressInputValue,
    suggestions: siteAddressSuggestions,
    loading: siteAddressLoading,
    error: siteAddressError,
    handleInputChange: handleSiteAddressChange,
    handleSelectSuggestion: handleSiteAddressSelect,
    clearSuggestions: clearSiteSuggestions,
    setInputValueManual: setSiteInputValue,
  } = usePlacesAutocomplete({
    initialValue: initialSiteAddress.current,
    onSelect: details => {
      if (details) {
        console.log('Estimate BasicInfoStep - Site Location Details:', details);
        const parsed = parseAddressComponents(details.address_components);
        const fullStreet = getFullStreetAddress(parsed);

        // Update site location fields
        setValue('location.address', details.formatted_address || fullStreet, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue('location.city', parsed.city, { shouldValidate: true, shouldDirty: true });
        setValue('location.state', parsed.state, { shouldValidate: true, shouldDirty: true });
        setValue('location.zip', parsed.postalCode, { shouldValidate: true, shouldDirty: true });
      } else {
        console.error('Estimate BasicInfoStep: Failed to get site location details');
        // Clear fields on error
        setValue('location.city', '', { shouldValidate: true, shouldDirty: true });
        setValue('location.state', '', { shouldValidate: true, shouldDirty: true });
        setValue('location.zip', '', { shouldValidate: true, shouldDirty: true });
      }
    },
  });

  // Handle site address input change
  const handleSiteAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSiteAddressChange(e);
    setValue('location.address', e.target.value, { shouldDirty: true });
  };

  // Keep site address input synchronized
  const currentSiteAddressValue = watch('location.address');
  useEffect(() => {
    if (showSiteLocation && currentSiteAddressValue !== siteAddressInputValue) {
      setSiteInputValue(currentSiteAddressValue || '');
    }
  }, [currentSiteAddressValue, siteAddressInputValue, setSiteInputValue, showSiteLocation]);

  return (
    <div className="space-y-6 overflow-visible pb-10">
      <div className="grid grid-cols-1 gap-4 overflow-visible">
        <FormField
          control={form.control}
          name="project"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter project name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Customer</h3>

          <Tabs value={customerTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing" onClick={onExistingCustomer}>
                Existing Customer
              </TabsTrigger>
              <TabsTrigger value="new" onClick={onNewCustomer}>
                New Customer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="existing" className="pt-4">
              <FormField
                control={form.control}
                name="customer"
                render={({ field: customerField }) => (
                  <FormItem>
                    <FormLabel>Select Customer</FormLabel>
                    <FormControl>
                      <Select
                        value={customerField.value}
                        onValueChange={customerField.onChange}
                        disabled={loading}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={loading ? 'Loading customers...' : 'Select a customer'}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {loading ? (
                            <div className="flex items-center justify-center py-2">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              <span>Loading...</span>
                            </div>
                          ) : (
                            customers.map(customer => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedCustomerId && hasCustomerAddress && (
                <div className="mt-4 mb-2">
                  <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 mt-0.5 text-blue-500 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">Customer Address on File:</p>
                        <p className="text-sm text-gray-700 font-medium">{customerAddress}</p>
                      </div>
                    </div>
                    <div className="flex items-center mt-3 gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      <p className="text-xs">
                        This address will be used for the job location unless you specify a
                        different one below
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedCustomerId && !hasCustomerAddress && (
                <div className="mt-4 mb-2">
                  <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 mt-0.5 text-yellow-500 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">Customer Address Not Found</p>
                        <p className="text-sm text-gray-700">
                          This customer doesn't have an address on file. Please specify a job site
                          location below.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedCustomerId && (
                <FormField
                  control={form.control}
                  name="showSiteLocation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-yellow-50 border-yellow-200 mt-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-medium">
                          Different Job Site Location?
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          {hasCustomerAddress
                            ? 'Toggle this ON if the job will be performed at a location different from the customer address shown above'
                            : 'Toggle this ON to specify the job site location'}
                        </div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </TabsContent>

            <TabsContent value="new" className="pt-4 space-y-4">
              <FormField
                control={form.control}
                name="newCustomer.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter customer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="newCustomer.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newCustomer.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="p-4 rounded-md bg-blue-50 border border-blue-200">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  Customer Primary Address
                </h4>
                {/* Customer Address field with Autocomplete */}
                <FormField
                  control={form.control}
                  name="newCustomer.address"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Start typing address..."
                          {...field}
                          value={customerAddressInputValue}
                          onChange={handleCustomerAddressInputChange}
                          onBlur={() => setTimeout(clearCustomerSuggestions, 150)}
                        />
                      </FormControl>
                      {customerAddressLoading && (
                        <div className="text-sm text-muted-foreground absolute top-full left-0 mt-1 z-10">
                          Loading...
                        </div>
                      )}
                      {customerAddressError && (
                        <div className="text-sm text-red-600 absolute top-full left-0 mt-1 z-10">
                          {customerAddressError}
                        </div>
                      )}
                      {customerAddressSuggestions.length > 0 && (
                        <ul className="absolute z-10 w-full bg-background border border-border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                          {customerAddressSuggestions.map(suggestion => (
                            <li
                              key={suggestion.place_id}
                              className="px-3 py-2 cursor-pointer hover:bg-accent"
                              onMouseDown={() => handleCustomerAddressSelect(suggestion.place_id)}
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

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                  <FormField
                    control={form.control}
                    name="newCustomer.city"
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
                    control={form.control}
                    name="newCustomer.state"
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
                    name="newCustomer.zip"
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

              <FormField
                control={form.control}
                name="showSiteLocation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-yellow-50 border-yellow-200 mt-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-medium">
                        Different Job Site Location?
                      </FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Toggle this ON if the job will be performed at a location different from the
                        customer address entered above
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value || false} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Add standalone job site location option when neither new nor existing tab is selected */}
        {!form.watch('customer') &&
          customerTab === 'existing' &&
          !form.watch('newCustomer.name') && (
            <FormField
              control={form.control}
              name="showSiteLocation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-gray-50 border-gray-200 mt-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Different Job Site Location?</FormLabel>
                    <div className="text-xs text-muted-foreground">
                      Select a customer first, then toggle this if the job site will be at a
                      different location
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                      disabled={!form.watch('customer') && !form.watch('newCustomer.name')}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter project description"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {showSiteLocation && (
          <>
            <div className="flex justify-center mt-2 mb-2">
              <span className="text-xs text-blue-500 animate-bounce">
                ▼ Job Site Location Fields Below ▼
              </span>
            </div>

            <div id="job-site-location" className="space-y-4 border-l-2 border-[#0485ea] pl-4 mt-4">
              <Alert className="bg-blue-50 border-blue-200 mb-4">
                <Info className="h-4 w-4" />
                <AlertDescription className="font-medium">
                  Job Site Location (Different from Customer Address)
                </AlertDescription>
              </Alert>

              {/* Site Location Address with Autocomplete */}
              <FormField
                control={form.control}
                name="location.address"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel>Site Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Start typing job site address..."
                        {...field}
                        value={siteAddressInputValue}
                        onChange={handleSiteAddressInputChange}
                        onBlur={() => setTimeout(clearSiteSuggestions, 150)}
                      />
                    </FormControl>
                    {siteAddressLoading && (
                      <div className="text-sm text-muted-foreground absolute top-full left-0 mt-1 z-10">
                        Loading...
                      </div>
                    )}
                    {siteAddressError && (
                      <div className="text-sm text-red-600 absolute top-full left-0 mt-1 z-10">
                        {siteAddressError}
                      </div>
                    )}
                    {siteAddressSuggestions.length > 0 && (
                      <ul className="absolute z-10 w-full bg-background border border-border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                        {siteAddressSuggestions.map(suggestion => (
                          <li
                            key={suggestion.place_id}
                            className="px-3 py-2 cursor-pointer hover:bg-accent"
                            onMouseDown={() => handleSiteAddressSelect(suggestion.place_id)}
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
                  control={form.control}
                  name="location.city"
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
                  control={form.control}
                  name="location.state"
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
                  name="location.zip"
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
          </>
        )}

        {showSiteLocation && (
          <div className="flex justify-center mt-2 mb-4">
            <span className="text-xs text-gray-500">
              ▲ Scroll up to see all job site location fields ▲
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BasicInfoStep;
