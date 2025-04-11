
import React, { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { timeOptions } from '../utils/timeUtils';

export interface TimePickerSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string; 
  id?: string;
}

const TimePickerSelect: React.FC<TimePickerSelectProps> = ({ 
  value,
  onChange,
  label,
  id
}) => {
  // Filter time options to 15-minute increments
  const filteredOptions = useMemo(() => {
    return timeOptions.filter(option => {
      const [_, minutes] = option.value.split(':').map(Number);
      return minutes % 15 === 0; // Only include 15-minute increments
    });
  }, []);

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <Select
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder="Select time">
            {filteredOptions.find(opt => opt.value === value)?.display || '12:00 AM'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {filteredOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.display}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TimePickerSelect;
