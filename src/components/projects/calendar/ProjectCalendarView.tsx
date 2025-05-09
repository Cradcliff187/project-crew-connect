import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  startOfWeek,
  endOfWeek,
  getDay,
  addDays,
} from 'date-fns';
import { useScheduleItems } from '../schedule/hooks/useScheduleItems';
import { ScheduleItem } from '../schedule/ScheduleItemFormDialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ProjectCalendarViewProps {
  projectId: string;
}

export default function ProjectCalendarView({ projectId }: ProjectCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { loading, error, scheduleItems } = useScheduleItems(projectId);

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between py-2">
        <h2 className="text-base font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const dateFormat = 'EEE';
    const days = [];
    const startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="font-medium text-center text-sm text-muted-foreground py-2">
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }
    return <div className="grid grid-cols-7">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = 'd';
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);

        // Filter schedule items starting on this day (simplistic view for now)
        const dayScheduleItems = scheduleItems.filter(item => {
          if (item.start_datetime) {
            const itemStartDate = new Date(item.start_datetime);
            // Check if the item STARTS on this day
            // More complex logic needed to show items spanning multiple days
            return isSameDay(itemStartDate, day);
          }
          return false;
        });

        days.push(
          <div
            key={i}
            className={cn(
              'min-h-24 border p-1 transition-all',
              !isSameMonth(day, monthStart) && 'bg-muted/50',
              isSameDay(day, selectedDate) && 'bg-accent/80',
              'hover:bg-accent/20 cursor-pointer'
            )}
            onClick={() => setSelectedDate(day)}
          >
            <div className="flex justify-between">
              <span
                className={cn(
                  'text-sm font-medium',
                  !isSameMonth(day, monthStart) && 'text-muted-foreground',
                  isSameDay(day, new Date()) && 'bg-primary text-primary-foreground px-1 rounded-md'
                )}
              >
                {formattedDate}
              </span>
            </div>
            <div className="mt-1 overflow-y-auto max-h-20 space-y-1">
              {dayScheduleItems.map(item => (
                <div
                  key={item.id}
                  className={cn(
                    'text-xs p-1 rounded truncate',
                    'bg-blue-100 text-blue-800' // Basic styling for now
                  )}
                  title={item.title}
                >
                  {item.title}
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }

      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }

    return <div className="space-y-1">{rows}</div>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <p className="text-red-500 mb-2">Error loading calendar</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Project Calendar</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </CardContent>
    </Card>
  );
}
