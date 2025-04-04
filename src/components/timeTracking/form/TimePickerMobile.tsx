
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface TimePickerMobileProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  error?: string;
}

const TimePickerMobile: React.FC<TimePickerMobileProps> = ({
  value,
  onChange,
  label,
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hour, setHour] = useState<number>(0);
  const [minute, setMinute] = useState<number>(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

  // Parse time value when opened
  useEffect(() => {
    if (value) {
      const [hourStr, minuteStr] = value.split(':');
      let hourVal = parseInt(hourStr, 10);
      const minuteVal = parseInt(minuteStr, 10);
      
      // Convert 24h format to 12h format
      let periodVal: 'AM' | 'PM' = 'AM';
      if (hourVal >= 12) {
        periodVal = 'PM';
        if (hourVal > 12) hourVal -= 12;
      }
      if (hourVal === 0) hourVal = 12;
      
      setHour(hourVal);
      setMinute(minuteVal);
      setPeriod(periodVal);
    } else {
      // Default to current time if no value
      const now = new Date();
      let hourVal = now.getHours();
      const minuteVal = now.getMinutes();
      
      let periodVal: 'AM' | 'PM' = 'AM';
      if (hourVal >= 12) {
        periodVal = 'PM';
        if (hourVal > 12) hourVal -= 12;
      }
      if (hourVal === 0) hourVal = 12;
      
      setHour(hourVal);
      setMinute(Math.floor(minuteVal / 15) * 15); // Round to nearest 15 minutes
      setPeriod(periodVal);
    }
  }, [value, isOpen]);

  // Apply the selected time
  const handleApply = () => {
    // Convert back to 24h format
    let hour24 = hour;
    if (period === 'PM' && hour !== 12) hour24 += 12;
    if (period === 'AM' && hour === 12) hour24 = 0;
    
    const timeString = `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    onChange(timeString);
    setIsOpen(false);
  };

  // Generate time display in 12-hour format
  const getTimeDisplay = () => {
    if (!value) return 'Select time';
    
    const [hourStr, minuteStr] = value.split(':');
    let hourVal = parseInt(hourStr, 10);
    const minuteVal = parseInt(minuteStr, 10);
    
    let periodVal = 'AM';
    if (hourVal >= 12) {
      periodVal = 'PM';
      if (hourVal > 12) hourVal -= 12;
    }
    if (hourVal === 0) hourVal = 12;
    
    return `${hourVal}:${minuteStr} ${periodVal}`;
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = [0, 15, 30, 45];

  return (
    <div className="space-y-1 w-full">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
      </div>
      
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className={cn(
          "w-full justify-start text-left font-normal",
          error && "border-destructive",
          !value && "text-muted-foreground"
        )}
      >
        <Clock className="mr-2 h-4 w-4" />
        {getTimeDisplay()}
      </Button>
      
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader className="text-left">
            <SheetTitle>Select {label}</SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 flex flex-col items-center">
            <div className="flex justify-center items-center gap-4 mb-6">
              <div className="text-center">
                <div className="mb-2 text-sm font-medium text-muted-foreground">Hour</div>
                <div className="h-[240px] overflow-y-auto py-2 px-4">
                  {hours.map((h) => (
                    <div
                      key={h}
                      className={cn(
                        "py-2 px-4 rounded-md text-center cursor-pointer",
                        hour === h ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      )}
                      onClick={() => setHour(h)}
                    >
                      {h}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-center">
                <div className="mb-2 text-sm font-medium text-muted-foreground">Minute</div>
                <div className="h-[240px] overflow-y-auto py-2 px-4">
                  {minutes.map((m) => (
                    <div
                      key={m}
                      className={cn(
                        "py-2 px-4 rounded-md text-center cursor-pointer",
                        minute === m ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      )}
                      onClick={() => setMinute(m)}
                    >
                      {m.toString().padStart(2, '0')}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-center">
                <div className="mb-2 text-sm font-medium text-muted-foreground">AM/PM</div>
                <div className="py-2 px-4">
                  <div
                    className={cn(
                      "py-2 px-4 rounded-md text-center cursor-pointer",
                      period === 'AM' ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    )}
                    onClick={() => setPeriod('AM')}
                  >
                    AM
                  </div>
                  <div
                    className={cn(
                      "py-2 px-4 rounded-md text-center cursor-pointer mt-2",
                      period === 'PM' ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    )}
                    onClick={() => setPeriod('PM')}
                  >
                    PM
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center text-xl font-medium">
              {hour}:{minute.toString().padStart(2, '0')} {period}
            </div>
            
            <Button
              onClick={handleApply}
              className="mt-6 w-full bg-[#0485ea] hover:bg-[#0375d1]"
            >
              Apply
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default TimePickerMobile;
