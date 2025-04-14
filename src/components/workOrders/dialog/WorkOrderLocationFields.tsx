import { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { WorkOrderFormValues } from './WorkOrderFormSchema';
import CustomerSelect from './fields/CustomerSelect';
import LocationSelect from './fields/LocationSelect';
import AssigneeSelect from './fields/AssigneeSelect';
import CreateLocationToggle from './fields/CreateLocationToggle';
import CustomLocationFields from './fields/CustomLocationFields';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  employees,
}: WorkOrderLocationFieldsProps) => {
  const [selectedCustomerAddress, setSelectedCustomerAddress] = useState<string | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState<string | null>(null);
  const customerId = form.watch('customer_id');

  // Fetch customer address when customer is selected
  useEffect(() => {
    if (customerId) {
      const fetchCustomerDetails = async () => {
        const { data, error } = await supabase
          .from('customers')
          .select('customername, address, city, state, zip')
          .eq('customerid', customerId)
          .single();

        if (!error && data) {
          setSelectedCustomerName(data.customername);

          if (data.address && data.city && data.state) {
            const formattedAddress =
              `${data.address}, ${data.city}, ${data.state} ${data.zip || ''}`.trim();
            setSelectedCustomerAddress(formattedAddress);
          } else {
            setSelectedCustomerAddress(null);
          }
        }
      };

      fetchCustomerDetails();
    } else {
      setSelectedCustomerAddress(null);
      setSelectedCustomerName(null);
    }
  }, [customerId]);

  return (
    <div className="space-y-4">
      <h3 className="text-md font-semibold text-gray-700">Location Information</h3>

      <CustomerSelect form={form} customers={customers} />

      {selectedCustomerAddress && !useCustomAddress && (
        <Card className="border-[#0485ea]/20 bg-[#0485ea]/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex gap-2 items-start">
              <AlertCircle className="h-5 w-5 text-[#0485ea] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[#0485ea]">
                  Customer address for {selectedCustomerName}:
                </p>
                <p className="text-sm text-gray-700">{selectedCustomerAddress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <CreateLocationToggle form={form} />

      {!useCustomAddress ? (
        <LocationSelect form={form} locations={locations} />
      ) : (
        <CustomLocationFields form={form} />
      )}

      <AssigneeSelect form={form} employees={employees} />
    </div>
  );
};

export default WorkOrderLocationFields;
