import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Check } from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  parseISO,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import { ScheduleItem } from '@/types/schedule';
import { Badge } from '@/components/ui/badge';

interface ProjectCalendarViewProps {
  scheduleItems: ScheduleItem[];
  onItemClick?: (item: ScheduleItem) => void;
  onDateClick?: (date: Date) => void;
  onAddClick?: () => void;
}

const ProjectCalendarView = ({
  scheduleItems = [],
  onItemClick,
  onDateClick,
  onAddClick,
}: ProjectCalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Calculate the days in the current month
  const daysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of month
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    // Create array of day objects
    const days = [];

    // Add previous month's days to fill first week
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    // Add current month's days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Add next month's days to fill last week
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          date: new Date(year, month + 1, i),
          isCurrentMonth: false,
        });
      }
    }

    return days;
  };

  // Filter items for the current month
  const getItemsForMonth = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    return scheduleItems.filter(item => {
      const startDate = parseISO(item.start_datetime);
      const endDate = parseISO(item.end_datetime);

      // Check if item falls within this month
      return (
        isWithinInterval(startDate, { start: monthStart, end: monthEnd }) ||
        isWithinInterval(endDate, { start: monthStart, end: monthEnd }) ||
        (startDate < monthStart && endDate > monthEnd) // Spans the entire month
      );
    });
  };

  // Get items for a specific day
  const getItemsForDay = (date: Date) => {
    return scheduleItems.filter(item => {
      const startDate = parseISO(item.start_datetime);
      const endDate = parseISO(item.end_datetime);

      // Check if item falls on this day
      return (
        isWithinInterval(date, { start: startDate, end: endDate }) ||
        (startDate.getDate() === date.getDate() &&
          startDate.getMonth() === date.getMonth() &&
          startDate.getFullYear() === date.getFullYear())
      );
    });
  };

  // Navigation functions
  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  // Render the calendar grid
  const renderCalendarGrid = () => {
    const days = daysInMonth();
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="calendar-grid">
        {/* Header row with day names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center font-medium py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const dayItems = getItemsForDay(day.date);
            const hasItems = dayItems.length > 0;

            return (
              <div
                key={index}
                className={`min-h-24 p-1 border rounded-md ${
                  day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
                } ${
                  format(day.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                    ? 'ring-2 ring-primary ring-offset-1'
                    : ''
                }`}
                onClick={() => {
                  if (onDateClick) onDateClick(day.date);
                }}
              >
                <div className="flex justify-between items-start">
                  <span className="font-medium">{format(day.date, 'd')}</span>
                  {hasItems && <Badge>{dayItems.length}</Badge>}
                </div>

                {/* List of events for this day (limited to 3) */}
                <div className="mt-1 space-y-1 overflow-hidden">
                  {dayItems.slice(0, 3).map(item => (
                    <div
                      key={item.id}
                      className={`text-xs p-1 rounded truncate cursor-pointer ${
                        item.is_completed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                      onClick={e => {
                        e.stopPropagation();
                        if (onItemClick) onItemClick(item);
                      }}
                    >
                      {item.is_completed && <Check className="inline h-3 w-3 mr-1" />}
                      {format(parseISO(item.start_datetime), 'h:mm a')} - {item.title}
                    </div>
                  ))}
                  {dayItems.length > 3 && (
                    <div className="text-xs text-gray-500">+{dayItems.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Project Calendar</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          {onAddClick && (
            <Button size="sm" onClick={onAddClick}>
              <Plus className="h-4 w-4 mr-1" /> Add Event
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold mb-4">{format(currentMonth, 'MMMM yyyy')}</div>
        {renderCalendarGrid()}
        <div className="text-xs text-gray-500 mt-4">
          Showing {getItemsForMonth().length} events in {format(currentMonth, 'MMMM yyyy')}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCalendarView;
