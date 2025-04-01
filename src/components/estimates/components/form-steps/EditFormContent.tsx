
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import CustomerFormFields from '../CustomerFormFields';
import CustomerSelector from '../CustomerSelector';
import LocationFields from '../LocationFields';
import EstimateItemFields from '../EstimateItemFields';
import ContingencyInput from '../summary/ContingencyInput';
import EstimateSummary from '../EstimateSummary';
import FormActions from './FormActions';

interface EditFormContentProps {
  customers: { id: string; name: string; address?: string; city?: string; state?: string; zip?: string; }[];
  selectedCustomerAddress: string | null;
  selectedCustomerName: string | null;
  customerTab: 'existing' | 'new';
  onNewCustomer: () => void;
  onExistingCustomer: () => void;
  onPreview: (e?: React.MouseEvent) => void;
  onCancel: () => void;
}

const EditFormContent = ({
  customers,
  selectedCustomerAddress,
  selectedCustomerName,
  customerTab,
  onNewCustomer,
  onExistingCustomer,
  onPreview,
  onCancel
}: EditFormContentProps) => {
  const form = useFormContext<EstimateFormValues>();
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="project"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="Project name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
          <div className="mb-2 font-medium">Customer</div>
          <Tabs value={customerTab} onValueChange={(value) => value === 'new' ? onNewCustomer() : onExistingCustomer()}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing">Existing Customer</TabsTrigger>
              <TabsTrigger value="new">New Customer</TabsTrigger>
            </TabsList>
            <TabsContent value="existing">
              <CustomerSelector customers={customers} />
            </TabsContent>
            <TabsContent value="new">
              <CustomerFormFields />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Project Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Provide a detailed description of the work"
                className="resize-none min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <LocationFields 
        selectedCustomerAddress={selectedCustomerAddress} 
      />
      
      <h3 className="text-lg font-semibold mt-8 mb-4">Line Items</h3>
      <EstimateItemFields />
      
      <h3 className="text-lg font-semibold mt-8 mb-4">Estimate Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <ContingencyInput />
        </div>
        <div className="md:col-span-2">
          <EstimateSummary />
        </div>
      </div>
      
      <FormActions 
        onCancel={onCancel}
        onPreview={onPreview}
        isPreviewStep={false}
      />
    </>
  );
};

export default EditFormContent;
