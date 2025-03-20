
import { UseFormReturn } from 'react-hook-form';
import { WorkOrderFormValues } from './WorkOrderFormSchema';
import CustomerSelect from './fields/CustomerSelect';
import CreateLocationToggle from './fields/CreateLocationToggle';
import LocationSelect from './fields/LocationSelect';
import CustomLocationFields from './fields/CustomLocationFields';
import AssigneeSelect from './fields/AssigneeSelect';

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
  return (
    <div className="space-y-4">
      <h3 className="text-md font-semibold text-gray-700">Location Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomerSelect form={form} customers={customers} />
        <CreateLocationToggle form={form} />
      </div>
      
      {!useCustomAddress ? (
        <LocationSelect form={form} locations={locations} />
      ) : (
        <CustomLocationFields form={form} />
      )}
      
      <h3 className="text-md font-semibold text-gray-700 mt-6">Assignment</h3>
      <AssigneeSelect form={form} employees={employees} />
    </div>
  );
};

export default WorkOrderLocationFields;
