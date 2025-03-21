
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../schemas/estimateFormSchema';
import LocationToggle from './LocationToggle';
import LocationFields from './LocationFields';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';

interface LocationSectionProps {
  useCustomLocation: boolean;
  handleCustomLocationToggle: (checked: boolean) => void;
  customerAddress?: {
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}

const LocationSection = ({ 
  useCustomLocation, 
  handleCustomLocationToggle,
  customerAddress 
}: LocationSectionProps) => {
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
            Using customer address as job site location:
          </p>
          {customerAddress && (
            <div className="mt-2 text-sm text-gray-700">
              <p>{customerAddress.address || 'No address provided'}</p>
              <p>
                {[
                  customerAddress.city,
                  customerAddress.state,
                  customerAddress.zip
                ].filter(Boolean).join(', ')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSection;
