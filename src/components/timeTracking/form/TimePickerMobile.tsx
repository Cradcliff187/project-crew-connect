
import React from 'react';
import { Label } from '@/components/ui/label';

interface TimePickerMobileProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

const TimePickerMobile: React.FC<TimePickerMobileProps> = ({ 
  value,
  onChange,
  label
}) => {
  return (
    <div>
      {label && <Label className="mb-2 block">{label}</Label>}
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#0485ea]/20 focus:border-[#0485ea]"
      />
    </div>
  );
};

export default TimePickerMobile;
