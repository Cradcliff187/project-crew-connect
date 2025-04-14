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
import { Loader2 } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Customer</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange} disabled={loading}>
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

              {selectedCustomerAddress && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">{selectedCustomerAddress}</div>
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

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="newCustomer.city"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
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
                        <Input placeholder="State" {...field} />
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
                        <Input placeholder="ZIP code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

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

        <FormField
          control={form.control}
          name="showSiteLocation"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Different Job Site Location</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Specify a different location for the job site.
                </div>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {showSiteLocation && (
          <div className="space-y-4 border-l-2 border-[#0485ea] pl-4">
            <FormField
              control={form.control}
              name="location.address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter job site address" {...field} />
                  </FormControl>
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
                      <Input placeholder="Enter city" {...field} />
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
                      <Input placeholder="State" {...field} />
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
                      <Input placeholder="ZIP code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BasicInfoStep;
