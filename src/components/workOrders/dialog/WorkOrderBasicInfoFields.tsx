import { UseFormReturn } from 'react-hook-form';
import { WorkOrderFormValues } from './WorkOrderFormSchema';
import TitleNumberFields from './fields/TitleNumberFields';
import PriorityPoFields from './fields/PriorityPoFields';
import DescriptionField from './fields/DescriptionField';

interface WorkOrderBasicInfoFieldsProps {
  form: UseFormReturn<WorkOrderFormValues>;
}

const WorkOrderBasicInfoFields = ({ form }: WorkOrderBasicInfoFieldsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-md font-semibold text-gray-700">Basic Information</h3>

      <TitleNumberFields form={form} />
      <PriorityPoFields form={form} />
      <DescriptionField form={form} />
    </div>
  );
};

export default WorkOrderBasicInfoFields;
