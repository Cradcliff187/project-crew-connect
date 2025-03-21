
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../schemas/estimateFormSchema';
import LocationToggle from './LocationToggle';
import LocationFields from './LocationFields';

interface LocationSectionProps {
  useCustomLocation: boolean;
  handleCustomLocationToggle: (checked: boolean) => void;
}

const LocationSection = ({ useCustomLocation, handleCustomLocationToggle }: LocationSectionProps) => {
  const form = useFormContext<EstimateFormValues>();
  
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <h2 className="text-xl font-montserrat font-semibold mb-4 text-[#333333]">Location Details</h2>
      
      <LocationToggle 
        useCustomLocation={useCustomLocation}
        onToggleChange={handleCustomLocationToggle}
      />

      <LocationFields />
    </div>
  );
};

export default LocationSection;
