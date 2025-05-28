import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { FormData } from './hooks/useWorkOrderData';
import { UseFormReturn, Controller } from 'react-hook-form';
import { WorkOrderFormValues } from './WorkOrderFormSchema';
import CreateLocationToggle from './fields/CreateLocationToggle';
import { ChevronRight, Loader2, Save } from 'lucide-react';
import React from 'react';
import { usePlacesAutocomplete, PlaceDetails } from '@/hooks/usePlacesAutocomplete';
import { parseAddressComponents, getFullStreetAddress } from '@/utils/addressUtils';

// Define the steps in the work order creation process
export const WORK_ORDER_STEPS = [
  { id: 'basic-info', title: 'Basic Info' },
  { id: 'schedule', title: 'Schedule' },
  { id: 'location', title: 'Location' },
  { id: 'assignment', title: 'Assignment' },
  { id: 'review', title: 'Review' },
];

// Step tabs component
export const WorkOrderStepTabs = ({
  currentStep,
  setCurrentStep,
  isDisabled,
}: {
  currentStep: string;
  setCurrentStep: (step: string) => void;
  isDisabled: boolean;
}) => {
  return (
    <Tabs value={currentStep} className="w-full">
      <TabsList className="grid grid-cols-5 h-auto">
        {WORK_ORDER_STEPS.map(step => (
          <TabsTrigger
            key={step.id}
            value={step.id}
            className={cn(
              'py-2 text-xs',
              currentStep === step.id &&
                'bg-primary text-primary-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
            )}
            onClick={() => !isDisabled && setCurrentStep(step.id)}
            disabled={isDisabled}
          >
            {step.title}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

// Loading state component
export const WorkOrderLoadingState = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
};

// Basic Info Fields component
export const BasicInfoFields = ({ form }: { form: UseFormReturn<WorkOrderFormValues> }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Work Order Title</FormLabel>
            <FormControl>
              <Input placeholder="Enter work order title" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="work_order_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Work Order Number <span className="text-muted-foreground">(Optional)</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="WO-00001" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Description <span className="text-muted-foreground">(Optional)</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe the work to be done"
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="po_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                PO Number <span className="text-muted-foreground">(Optional)</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Purchase Order Number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

// Schedule Fields component
export const ScheduleFields = ({ form }: { form: UseFormReturn<WorkOrderFormValues> }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="time_estimate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Time Estimate (Hours) <span className="text-muted-foreground">(Optional)</span>
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Estimated hours to complete"
                {...field}
                value={field.value === undefined ? '' : field.value}
                onChange={e => {
                  const value = e.target.value ? parseFloat(e.target.value) : undefined;
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="scheduled_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>
                Scheduled Date <span className="text-muted-foreground">(Optional)</span>
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={date => field.onChange(date)}
                    disabled={date => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="due_by_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>
                Due By <span className="text-muted-foreground">(Optional)</span>
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={date => field.onChange(date)}
                    disabled={date => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

// Location Fields component
export const LocationFields = ({
  form,
  formData,
  useCustomAddress,
}: {
  form: UseFormReturn<WorkOrderFormValues>;
  formData: FormData;
  useCustomAddress: boolean;
}) => {
  // --- Autocomplete Hook Setup (for custom address) ---
  const { setValue, watch } = form;
  const initialCustomAddress = React.useRef(form.getValues('address') || ''); // Get initial value if available

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
    initialValue: initialCustomAddress.current,
    onSelect: details => {
      if (details && useCustomAddress) {
        // Only update if custom address is active
        console.log('WorkOrder LocationFields Place Details Received:', details);
        const parsed = parseAddressComponents(details.address_components);
        const fullStreet = getFullStreetAddress(parsed);

        // Update react-hook-form fields
        setValue('address', details.formatted_address || fullStreet, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue('city', parsed.city, { shouldValidate: true, shouldDirty: true });
        setValue('state', parsed.state, { shouldValidate: true, shouldDirty: true });
        setValue('zip', parsed.postalCode, { shouldValidate: true, shouldDirty: true });
      } else if (useCustomAddress) {
        console.error('WorkOrder LocationFields: Failed to get place details.');
        // Optionally clear related fields if details fetch fails
        setValue('city', '', { shouldValidate: true, shouldDirty: true });
        setValue('state', '', { shouldValidate: true, shouldDirty: true });
        setValue('zip', '', { shouldValidate: true, shouldDirty: true });
      }
    },
  });

  // Handle address input change for both hook and react-hook-form
  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleAutocompleteInputChange(e); // Update hook's internal state
    setValue('address', e.target.value, { shouldDirty: true }); // Update RHF state
  };

  // Handle selecting a suggestion
  const handleSuggestionClick = (placeId: string) => {
    handleSelectSuggestion(placeId); // Trigger details fetch via hook
  };

  // Sync hook input value if form value changes externally (e.g., reset, toggle)
  const currentAddressValue = watch('address');
  React.useEffect(() => {
    // Only sync if custom address is active and the value differs
    if (useCustomAddress && currentAddressValue !== autocompleteInputValue) {
      setInputValueManual(currentAddressValue || '');
    }
    // If switching away from custom address, clear the hook's input/suggestions
    if (!useCustomAddress && autocompleteInputValue) {
      setInputValueManual('');
      clearSuggestions();
    }
  }, [
    useCustomAddress,
    currentAddressValue,
    autocompleteInputValue,
    setInputValueManual,
    clearSuggestions,
  ]);
  // --- End Autocomplete Hook Setup ---

  return (
    <>
      <FormField
        control={form.control}
        name="customer_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Customer <span className="text-muted-foreground">(Optional)</span>
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {formData.customers.map(customer => (
                  <SelectItem key={customer.customerid} value={customer.customerid}>
                    {customer.customername}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <CreateLocationToggle form={form} />

      {!useCustomAddress ? (
        <FormField
          control={form.control}
          name="location_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Location <span className="text-muted-foreground">(Optional)</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {formData.locations.map(location => (
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
        <>
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
                    disabled={!useCustomAddress}
                  />
                </FormControl>
                {useCustomAddress && autocompleteLoading && (
                  <div className="text-sm text-muted-foreground absolute top-full left-0 mt-1">
                    Loading...
                  </div>
                )}
                {useCustomAddress && autocompleteError && (
                  <div className="text-sm text-red-600 absolute top-full left-0 mt-1">
                    {autocompleteError}
                  </div>
                )}
                {useCustomAddress && suggestions.length > 0 && (
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
                    <Input placeholder="City" {...field} readOnly disabled={!useCustomAddress} />
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
                    <Input placeholder="State" {...field} readOnly disabled={!useCustomAddress} />
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
                    <Input placeholder="ZIP" {...field} readOnly disabled={!useCustomAddress} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </>
      )}
    </>
  );
};

// Assignment Fields component
export const AssignmentFields = ({
  form,
  formData,
}: {
  form: UseFormReturn<WorkOrderFormValues>;
  formData: FormData;
}) => {
  return (
    <FormField
      control={form.control}
      name="assigned_to"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            Assign To <span className="text-muted-foreground">(Optional)</span>
          </FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">Unassigned</SelectItem>
              {formData.employees.map(employee => (
                <SelectItem key={employee.employee_id} value={employee.employee_id}>
                  {`${employee.first_name} ${employee.last_name}`}
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

// Review Summary component
export const ReviewSummary = ({ form }: { form: UseFormReturn<WorkOrderFormValues> }) => {
  const values = form.getValues();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Work Order Summary</h3>
        <p className="text-muted-foreground text-sm mb-6">
          Please review the details below before creating this work order.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <div>
          <h4 className="text-sm font-semibold">Basic Information</h4>
          <dl className="mt-2 space-y-1">
            <div className="flex justify-between">
              <dt className="text-sm text-muted-foreground">Title:</dt>
              <dd className="text-sm">{values.title || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-muted-foreground">Work Order Number:</dt>
              <dd className="text-sm">{values.work_order_number || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-muted-foreground">Priority:</dt>
              <dd className="text-sm">{values.priority || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-muted-foreground">PO Number:</dt>
              <dd className="text-sm">{values.po_number || '—'}</dd>
            </div>
          </dl>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Schedule</h4>
          <dl className="mt-2 space-y-1">
            <div className="flex justify-between">
              <dt className="text-sm text-muted-foreground">Estimated Hours:</dt>
              <dd className="text-sm">
                {values.time_estimate ? `${values.time_estimate} hrs` : '—'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-muted-foreground">Scheduled Date:</dt>
              <dd className="text-sm">
                {values.scheduled_date ? format(new Date(values.scheduled_date), 'PPP') : '—'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-muted-foreground">Due By:</dt>
              <dd className="text-sm">
                {values.due_by_date ? format(new Date(values.due_by_date), 'PPP') : '—'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {values.description && (
        <div>
          <h4 className="text-sm font-semibold">Description</h4>
          <p className="text-sm mt-1 bg-muted p-2 rounded">{values.description}</p>
        </div>
      )}
    </div>
  );
};

// Component to render the correct step content
export const WorkOrderStepContent = ({
  currentStep,
  form,
  useCustomAddress,
  formData,
  dataLoaded,
  setCurrentStep,
}: {
  currentStep: string;
  form: UseFormReturn<WorkOrderFormValues>;
  useCustomAddress: boolean;
  formData: FormData;
  dataLoaded: boolean;
  setCurrentStep: (step: string) => void;
}) => {
  switch (currentStep) {
    case 'basic-info':
      return <BasicInfoFields form={form} />;
    case 'schedule':
      return <ScheduleFields form={form} />;
    case 'location':
      return dataLoaded ? (
        <LocationFields form={form} formData={formData} useCustomAddress={useCustomAddress} />
      ) : (
        <WorkOrderLoadingState />
      );
    case 'assignment':
      return dataLoaded ? (
        <AssignmentFields form={form} formData={formData} />
      ) : (
        <WorkOrderLoadingState />
      );
    case 'review':
      return <ReviewSummary form={form} />;
    default:
      return <div>Unknown step</div>;
  }
};

// Dialog footer with appropriate buttons for each step
export const WorkOrderDialogFooter = ({
  currentStep,
  isSubmitting,
  isLoading,
  dataLoaded,
  onPrevious,
  onNext,
  onCancel,
  onSubmit,
}: {
  currentStep: string;
  isSubmitting: boolean;
  isLoading: boolean;
  dataLoaded: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}) => {
  const isFirstStep = currentStep === WORK_ORDER_STEPS[0].id;
  const isLastStep = currentStep === WORK_ORDER_STEPS[WORK_ORDER_STEPS.length - 1].id;
  const isButtonDisabled = isLoading || isSubmitting || !dataLoaded;

  return (
    <div className="flex justify-between pt-4 border-t">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>

      <div className="flex space-x-2">
        {!isFirstStep && (
          <Button type="button" variant="outline" onClick={onPrevious} disabled={isButtonDisabled}>
            Previous
          </Button>
        )}

        {!isLastStep ? (
          <Button
            type="button"
            onClick={onNext}
            disabled={isButtonDisabled}
            className="bg-primary hover:bg-primary-foreground"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isButtonDisabled}
            className="bg-primary hover:bg-primary-foreground"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Submit Work Order
          </Button>
        )}
      </div>
    </div>
  );
};
