import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value?: { hour: number; minute: number };
  onChange?: (value: { hour: number; minute: number }) => void;
  className?: string;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [hour, setHour] = React.useState<number>(value?.hour ?? 0);
  const [minute, setMinute] = React.useState<number>(value?.minute ?? 0);

  React.useEffect(() => {
    setHour(value?.hour ?? 0);
    setMinute(value?.minute ?? 0);
  }, [value]);

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newHour = parseInt(e.target.value, 10);
    if (isNaN(newHour)) newHour = 0;
    newHour = Math.max(0, Math.min(23, newHour)); // Clamp between 0 and 23
    setHour(newHour);
    if (onChange) {
      onChange({ hour: newHour, minute });
    }
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newMinute = parseInt(e.target.value, 10);
    if (isNaN(newMinute)) newMinute = 0;
    newMinute = Math.max(0, Math.min(59, newMinute)); // Clamp between 0 and 59
    setMinute(newMinute);
    if (onChange) {
      onChange({ hour, minute: newMinute });
    }
  };

  // Format value with leading zero if needed
  const formatValue = (val: number) => String(val).padStart(2, '0');

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div>
        <Label htmlFor="hour-input" className="text-xs sr-only">
          Hour
        </Label>
        <Input
          id="hour-input"
          type="number"
          min="0"
          max="23"
          value={formatValue(hour)}
          onChange={handleHourChange}
          className="w-[60px] text-center h-8 text-sm"
          aria-label="Hour"
        />
      </div>
      <span className="text-muted-foreground">:</span>
      <div>
        <Label htmlFor="minute-input" className="text-xs sr-only">
          Minute
        </Label>
        <Input
          id="minute-input"
          type="number"
          min="0"
          max="59"
          step="1" // Allow single minute steps
          value={formatValue(minute)}
          onChange={handleMinuteChange}
          className="w-[60px] text-center h-8 text-sm"
          aria-label="Minute"
        />
      </div>
    </div>
  );
}
