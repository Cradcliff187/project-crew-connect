
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../schemas/estimateFormSchema';
import LocationToggle from './LocationToggle';
import LocationFields from './LocationFields';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';

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

      <Collapsible open={useCustomLocation}>
        <CollapsibleContent className="mt-4">
          <LocationFields />
        </CollapsibleContent>
      </Collapsible>
      
      {!useCustomLocation && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
          <p className="text-sm text-gray-600">
            Using customer address as job site location
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationSection;
