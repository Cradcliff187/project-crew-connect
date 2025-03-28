
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomerSelector from '../CustomerSelector';
import CustomerForm from '../CustomerForm';
import LocationFields from '../LocationFields';
import ContingencyInput from '../summary/ContingencyInput';
import EstimateItemFields from '../EstimateItemFields';
import EstimateSummary from '../EstimateSummary';
import EstimateDocumentUpload from '../EstimateDocumentUpload';
import { Button } from '@/components/ui/button';

interface EditFormContentProps {
  customers: { id: string; name: string; address?: string; city?: string; state?: string; zip?: string; }[];
  selectedCustomerAddress: string | null;
  selectedCustomerName: string | null;
  customerTab: 'existing' | 'new';
  onNewCustomer: () => void;
  onExistingCustomer: () => void;
  onPreview: () => void;
  onCancel: () => void;
}

const EditFormContent: React.FC<EditFormContentProps> = ({
  customers,
  selectedCustomerAddress,
  selectedCustomerName,
  customerTab,
  onNewCustomer,
  onExistingCustomer,
  onPreview,
  onCancel
}) => {
  const form = useFormContext<EstimateFormValues>();
  const showSiteLocation = form.watch('showSiteLocation');
  
  return (
    <div className="space-y-6">
      {/* Project Details */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
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
      </div>

      {/* Description */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Enter description" 
                className="resize-none min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Customer Tabs */}
      <div className="space-y-4">
        <FormLabel>Customer</FormLabel>
        <Tabs defaultValue={customerTab} onValueChange={(value) => {
          if (value === 'existing') onExistingCustomer();
          if (value === 'new') onNewCustomer();
        }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Existing Customer</TabsTrigger>
            <TabsTrigger value="new">New Customer</TabsTrigger>
          </TabsList>
          <TabsContent value="existing">
            <CustomerSelector 
              customers={customers} 
              selectedCustomerAddress={selectedCustomerAddress}
            />
          </TabsContent>
          <TabsContent value="new">
            <CustomerForm />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Site Location */}
      <LocationFields />
      
      {/* Document Upload - NEW COMPONENT */}
      <EstimateDocumentUpload />
      
      {/* Line Items */}
      <EstimateItemFields />
      
      {/* Summary */}
      <EstimateSummary />
      
      {/* Form Actions */}
      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="bg-[#0485ea] hover:bg-[#0375d1]"
          onClick={onPreview}
        >
          Review Estimate
        </Button>
      </div>
    </div>
  );
};

export default EditFormContent;
