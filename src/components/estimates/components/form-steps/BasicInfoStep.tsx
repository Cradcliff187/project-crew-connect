
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Plus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import CustomerFormFields from '../CustomerFormFields';

interface BasicInfoStepProps {
  customers: { id: string; name: string; address?: string; city?: string; state?: string; zip?: string; }[];
  selectedCustomerAddress: string | null;
  selectedCustomerName: string | null;
  onNewCustomer: () => void;
  onExistingCustomer: () => void;
  customerTab: 'existing' | 'new';
  isNewCustomer: boolean;
  showSiteLocation: boolean;
}

const BasicInfoStep = ({ 
  customers, 
  selectedCustomerAddress, 
  selectedCustomerName,
  onNewCustomer,
  onExistingCustomer,
  customerTab,
  isNewCustomer,
  showSiteLocation
}: BasicInfoStepProps) => {
  const form = useFormContext<EstimateFormValues>();
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="project"
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

        <div>
          {!isNewCustomer ? (
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <FormLabel>Customer*</FormLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs text-[#0485ea] h-6 px-2"
                  onClick={onNewCustomer}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add New Customer
                </Button>
              </div>
              <FormField
                control={form.control}
                name="customer"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue('showSiteLocation', false);
                    }} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        {customers.map((customer) => (
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
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <FormLabel>Customer</FormLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs text-[#0485ea] h-6 px-2"
                  onClick={onExistingCustomer}
                >
                  Select Existing Customer
                </Button>
              </div>
              <Tabs defaultValue="new" value={customerTab} onValueChange={(value) => {}}>
                <TabsContent value="new" className="mt-2 p-0">
                  <CustomerFormFields />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Job Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Enter job description" 
                className="min-h-[100px]" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {selectedCustomerAddress && !isNewCustomer && (
        <Card className="border-[#0485ea]/20 bg-[#0485ea]/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex gap-2 items-start">
              <AlertCircle className="h-5 w-5 text-[#0485ea] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[#0485ea]">
                  Customer address for {selectedCustomerName}:
                </p>
                <p className="text-sm text-gray-700">
                  {selectedCustomerAddress}
                </p>
                <div className="mt-2 flex items-center space-x-2">
                  <Checkbox
                    id="site-location"
                    checked={showSiteLocation}
                    onCheckedChange={(checked) => {
                      form.setValue('showSiteLocation', checked as boolean);
                    }}
                  />
                  <label
                    htmlFor="site-location"
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    Site location is different from customer address
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BasicInfoStep;
