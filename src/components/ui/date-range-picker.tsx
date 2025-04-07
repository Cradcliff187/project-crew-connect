
"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerWithRangeProps {
  className?: string;
  value?: DateRange | undefined;
  onChange?: (date: DateRange | undefined) => void;
}

export function DatePickerWithRange({
  className,
  value,
  onChange,
}: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(value);

  React.useEffect(() => {
    setDate(value);
  }, [value]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(newDate) => {
              setDate(newDate);
              if (onChange) {
                onChange(newDate);
              }
            }}
            numberOfMonths={2}
          />
          <div className="p-3 border-t border-border flex justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const today = new Date();
                const newDate = {
                  from: today,
                  to: addDays(today, 30),
                };
                setDate(newDate);
                if (onChange) {
                  onChange(newDate);
                }
              }}
            >
              Next 30 Days
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDate(undefined);
                if (onChange) {
                  onChange(undefined);
                }
              }}
            >
              Clear
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
