
import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import EstimatePreview from '../EstimatePreview';

interface ReviewStepProps {
  formData: EstimateFormValues;
  selectedCustomerName: string | null;
  selectedCustomerAddress: string | null;
}

const ReviewStep = ({ 
  formData, 
  selectedCustomerName, 
  selectedCustomerAddress 
}: ReviewStepProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Review Your Estimate</h3>
      <div className="border rounded-md p-4">
        <EstimatePreview 
          formData={formData} 
          selectedCustomerName={selectedCustomerName}
          selectedCustomerAddress={selectedCustomerAddress}
        />
      </div>
    </div>
  );
};

export default ReviewStep;
