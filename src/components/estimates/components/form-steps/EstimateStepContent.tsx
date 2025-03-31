
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import BasicInfoStep from './BasicInfoStep';
import LineItemsStep from './LineItemsStep';
import SummaryStep from './SummaryStep';
import ReviewStep from './ReviewStep';

interface EstimateStepContentProps {
  currentStep: string;
  customerTab: 'existing' | 'new';
  onNewCustomer: () => void;
  onExistingCustomer: () => void;
  selectedCustomerAddress: string | null;
  selectedCustomerName: string | null;
  customers: { id: string; name: string; address?: string; city?: string; state?: string; zip?: string; }[];
  loading: boolean;
}

const EstimateStepContent = ({
  currentStep,
  customerTab,
  onNewCustomer,
  onExistingCustomer,
  selectedCustomerAddress,
  selectedCustomerName,
  customers,
  loading
}: EstimateStepContentProps) => {
  const form = useFormContext<EstimateFormValues>();
  
  return (
    <Tabs value={currentStep} className="w-full">
      <TabsContent value="basic-info" className="m-0">
        <BasicInfoStep 
          customerTab={customerTab} 
          onNewCustomer={onNewCustomer} 
          onExistingCustomer={onExistingCustomer} 
          selectedCustomerAddress={selectedCustomerAddress}
          customers={customers}
          loading={loading}
        />
      </TabsContent>
      
      <TabsContent value="line-items" className="m-0">
        <LineItemsStep />
      </TabsContent>
      
      <TabsContent value="summary" className="m-0">
        <SummaryStep />
      </TabsContent>
      
      <TabsContent value="review" className="m-0">
        <ReviewStep 
          formData={form.getValues()}
          selectedCustomerName={selectedCustomerName} 
          selectedCustomerAddress={selectedCustomerAddress}
        />
      </TabsContent>
    </Tabs>
  );
};

export default EstimateStepContent;
