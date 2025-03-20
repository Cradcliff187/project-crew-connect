
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { WorkOrderFormValues } from './WorkOrderFormSchema';
import { useEffect } from 'react';

interface WorkOrderLocationFieldsProps {
  form: UseFormReturn<WorkOrderFormValues>;
  useCustomAddress: boolean;
  customers: { customerid: string; customername: string }[];
  locations: { location_id: string; location_name: string }[];
  employees: { employee_id: string; first_name: string; last_name: string }[];
}

const WorkOrderLocationFields = ({ 
  form, 
  useCustomAddress, 
  customers, 
  locations, 
  employees 
}: WorkOrderLocationFieldsProps) => {
  // Add effect to log customer data whenever it changes
  useEffect(() => {
    console.log('Customers data in component:', customers);
  }, [customers]);
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="customer_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value || ""}
                onOpenChange={(open) => {
                  if (open) console.log('Dropdown opened, customers:', customers);
                }}
              >
                <FormControl>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white z-50">
                  {customers && customers.length > 0 ? (
                    customers.map((customer) => {
                      console.log('Rendering customer option:', customer);
                      return (
                        <SelectItem 
                          key={customer.customerid} 
                          value={customer.customerid}
                          className="cursor-pointer hover:bg-gray-100"
                        >
                          {customer.customername}
                        </SelectItem>
                      );
                    })
                  ) : (
                    <SelectItem value="no-customers" disabled>No customers available</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="use_custom_address"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between space-y-0 pt-7">
              <FormLabel>Create New Location</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      
      {!useCustomAddress ? (
        <FormField
          control={form.control}
          name="location_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white z-50">
                  {locations && locations.length > 0 ? (
                    locations.map((location) => (
                      <SelectItem 
                        key={location.location_id} 
                        value={location.location_id}
                        className="cursor-pointer hover:bg-gray-100"
                      >
                        {location.location_name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-locations" disabled>No locations available</SelectItem>
                  )}
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
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="city"
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
              name="state"
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
              name="zip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter ZIP code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </>
      )}
      
      <FormField
        control={form.control}
        name="assigned_to"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Assigned To</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-white z-50">
                {employees && employees.length > 0 ? (
                  employees.map((employee) => (
                    <SelectItem 
                      key={employee.employee_id} 
                      value={employee.employee_id}
                      className="cursor-pointer hover:bg-gray-100"
                    >
                      {`${employee.first_name} ${employee.last_name}`}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-employees" disabled>No employees available</SelectItem>
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default WorkOrderLocationFields;
