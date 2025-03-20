
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { WorkOrderFormValues } from '../WorkOrderFormSchema';

interface LocationSelectProps {
  form: UseFormReturn<WorkOrderFormValues>;
  locations: { location_id: string; location_name: string }[];
}

const LocationSelect = ({ form, locations }: LocationSelectProps) => {
  return (
    <FormField
      control={form.control}
      name="location_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Location</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || ""}>
            <FormControl>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-white z-[1000]" sideOffset={4}>
              {locations && locations.length > 0 ? (
                locations.map((location) => (
                  <SelectItem 
                    key={location.location_id} 
                    value={location.location_id}
                    className="cursor-pointer hover:bg-gray-100 py-2 px-4"
                  >
                    {location.location_name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-locations" disabled className="text-gray-500">
                  No locations available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default LocationSelect;
