
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface TimePickerMobileProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
}

const TimePickerMobile: React.FC<TimePickerMobileProps> = ({
  value,
  onChange,
  label,
  error
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-1">
      {label && <Label htmlFor="time">{label}</Label>}
      <Input
        type="time"
        id="time"
        value={value}
        onChange={handleChange}
        className={error ? 'border-red-500' : ''}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default TimePickerMobile;
