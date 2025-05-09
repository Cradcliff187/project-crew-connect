import React from 'react';
import { Input } from './input';
import { Label } from './label';

interface TimePickerDemoProps {
  date: Date;
  setDate: (date: Date) => void;
}

export function TimePickerDemo({ date, setDate }: TimePickerDemoProps) {
  const minuteRef = React.useRef<HTMLInputElement>(null);
  const hourRef = React.useRef<HTMLInputElement>(null);

  const hours = date.getHours();
  const minutes = date.getMinutes();

  const formatTime = (value: number) => {
    return value.toString().padStart(2, '0');
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHour = parseInt(e.target.value, 10);
    if (isNaN(newHour)) return;

    const newDate = new Date(date);
    newDate.setHours(newHour);
    setDate(newDate);

    if (e.target.value.length === 2) {
      minuteRef.current?.focus();
      minuteRef.current?.select();
    }
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinute = parseInt(e.target.value, 10);
    if (isNaN(newMinute)) return;

    const newDate = new Date(date);
    newDate.setMinutes(newMinute);
    setDate(newDate);
  };

  const handleWheel = (e: React.WheelEvent, type: 'hour' | 'minute') => {
    e.preventDefault();

    const delta = e.deltaY > 0 ? -1 : 1;
    const newDate = new Date(date);

    if (type === 'hour') {
      const newHour = (hours + delta) % 24;
      newDate.setHours(newHour < 0 ? 23 : newHour);
    } else {
      const newMinute = (minutes + delta) % 60;
      newDate.setMinutes(newMinute < 0 ? 59 : newMinute);
    }

    setDate(newDate);
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="grid gap-1 text-center">
        <Input
          ref={hourRef}
          type="text"
          value={formatTime(hours)}
          onChange={handleHourChange}
          onWheel={e => handleWheel(e, 'hour')}
          className="w-14 text-center"
          maxLength={2}
        />
        <Label className="text-xs">Hour</Label>
      </div>
      <div className="text-center">:</div>
      <div className="grid gap-1 text-center">
        <Input
          ref={minuteRef}
          type="text"
          value={formatTime(minutes)}
          onChange={handleMinuteChange}
          onWheel={e => handleWheel(e, 'minute')}
          className="w-14 text-center"
          maxLength={2}
        />
        <Label className="text-xs">Min</Label>
      </div>
    </div>
  );
}
