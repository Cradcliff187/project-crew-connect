import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';

type CustomerFormFieldsProps = {
  onCancelNewCustomer?: () => void;
};

const CustomerFormFields = ({ onCancelNewCustomer }: CustomerFormFieldsProps) => {
  const form = useFormContext();

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="newCustomer.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Customer Name*</FormLabel>
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

      <h4 className="text-md font-medium">Address</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="newCustomer.address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newCustomer.city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input placeholder="Enter city" {...field} />
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
                <Input placeholder="Enter state" {...field} />
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
              <FormLabel>ZIP Code</FormLabel>
              <FormControl>
                <Input placeholder="Enter ZIP code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {onCancelNewCustomer && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCancelNewCustomer}
            className="text-sm text-gray-500 hover:text-[#0485ea]"
          >
            Cancel and select existing customer
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerFormFields;
