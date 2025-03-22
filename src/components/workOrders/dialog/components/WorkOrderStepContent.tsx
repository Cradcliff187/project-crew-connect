
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { UseFormReturn } from 'react-hook-form';
import { WorkOrderFormValues } from '../WorkOrderFormSchema';
import WorkOrderBasicInfoFields from '../WorkOrderBasicInfoFields';
import WorkOrderScheduleFields from '../WorkOrderScheduleFields';
import WorkOrderLocationFields from '../WorkOrderLocationFields';
import WorkOrderSummary from '../WorkOrderSummary';
import { FormData } from '../hooks/useWorkOrderData';

interface WorkOrderStepContentProps {
  currentStep: string;
  form: UseFormReturn<WorkOrderFormValues>;
  useCustomAddress: boolean;
  formData: FormData;
  dataLoaded: boolean;
  setCurrentStep: (step: string) => void;
}

const WorkOrderStepContent = ({
  currentStep,
  form,
  useCustomAddress,
  formData,
  dataLoaded,
  setCurrentStep
}: WorkOrderStepContentProps) => {
  return (
    <Tabs value={currentStep} onValueChange={setCurrentStep}>
      <TabsContent value="basic-info" className="mt-0">
        <WorkOrderBasicInfoFields form={form} />
      </TabsContent>
      
      <TabsContent value="schedule" className="mt-0">
        <WorkOrderScheduleFields form={form} />
      </TabsContent>
      
      {dataLoaded && (
        <TabsContent value="location" className="mt-0">
          <WorkOrderLocationFields 
            form={form} 
            useCustomAddress={useCustomAddress}
            customers={formData.customers}
            locations={formData.locations}
            employees={formData.employees}
          />
        </TabsContent>
      )}

      <TabsContent value="preview" className="mt-0">
        <WorkOrderSummary form={form} />
      </TabsContent>
    </Tabs>
  );
};

export default WorkOrderStepContent;
