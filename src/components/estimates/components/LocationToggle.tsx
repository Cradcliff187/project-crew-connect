
import { Switch } from '@/components/ui/switch';

interface LocationToggleProps {
  useCustomLocation: boolean;
  onToggleChange: (checked: boolean) => void;
}

const LocationToggle = ({ useCustomLocation, onToggleChange }: LocationToggleProps) => {
  return (
    <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
      <Switch
        id="custom-location"
        checked={useCustomLocation}
        onCheckedChange={onToggleChange}
        className="data-[state=checked]:bg-[#0485ea]"
      />
      <label
        htmlFor="custom-location"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Job site location is different from customer address
      </label>
    </div>
  );
};

export default LocationToggle;
