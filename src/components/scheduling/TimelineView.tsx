import { useMemo } from 'react';
import { format, addDays, startOfDay, differenceInDays } from 'date-fns';
import { ScheduleItem } from '@/types/schedule';
import { Check, Calendar, Clock } from 'lucide-react';

// Extend ScheduleItem for timeline-specific properties
interface TimelineScheduleItem extends ScheduleItem {
  _isContinuation?: boolean;
  _continues?: boolean;
}

interface TimelineViewProps {
  scheduleItems: ScheduleItem[];
  groupBy?: 'day' | 'week' | 'status' | 'assignee' | 'type';
  startDate?: Date;
  endDate?: Date;
  onItemClick?: (item: ScheduleItem) => void;
}

export function TimelineView({
  scheduleItems = [],
  groupBy = 'day',
  startDate,
  endDate,
  onItemClick,
}: TimelineViewProps) {
  // Calculate default date range if not provided
  const effectiveStartDate = useMemo(() => {
    if (startDate) return startOfDay(startDate);

    if (scheduleItems.length === 0) return startOfDay(new Date());

    return startOfDay(
      new Date(Math.min(...scheduleItems.map(item => new Date(item.start_datetime).getTime())))
    );
  }, [scheduleItems, startDate]);

  const effectiveEndDate = useMemo(() => {
    if (endDate) return endDate;

    if (scheduleItems.length === 0) return addDays(effectiveStartDate, 14);

    return startOfDay(
      addDays(
        new Date(Math.max(...scheduleItems.map(item => new Date(item.end_datetime).getTime()))),
        1
      )
    );
  }, [scheduleItems, endDate, effectiveStartDate]);

  // Group items according to the groupBy parameter
  const groupedItems = useMemo(() => {
    switch (groupBy) {
      case 'day': {
        // Create a map of days with their items
        const days: Record<string, TimelineScheduleItem[]> = {};
        const dayCount = differenceInDays(effectiveEndDate, effectiveStartDate) + 1;

        // Initialize days
        for (let i = 0; i < dayCount; i++) {
          const day = addDays(effectiveStartDate, i);
          const dayString = format(day, 'yyyy-MM-dd');
          days[dayString] = [];
        }

        // Add items to their respective days
        scheduleItems.forEach(item => {
          const startDay = startOfDay(new Date(item.start_datetime));
          const endDay = startOfDay(new Date(item.end_datetime));

          // For multi-day events, add to each day in the range
          for (let i = 0; i <= differenceInDays(endDay, startDay); i++) {
            const day = addDays(startDay, i);
            const dayString = format(day, 'yyyy-MM-dd');

            if (days[dayString]) {
              days[dayString].push({
                ...item,
                // Add a flag to indicate if this is a continuation
                _isContinuation: i > 0,
                // Add a flag to indicate if this continues to the next day
                _continues: i < differenceInDays(endDay, startDay),
              });
            }
          }
        });

        return Object.entries(days).map(([dayString, items]) => ({
          groupTitle: format(new Date(dayString), 'EEEE, MMMM d'),
          groupKey: dayString,
          items: items,
        }));
      }

      case 'status': {
        const completed: TimelineScheduleItem[] = [];
        const pending: TimelineScheduleItem[] = [];

        scheduleItems.forEach(item => {
          if (item.is_completed) {
            completed.push(item as TimelineScheduleItem);
          } else {
            pending.push(item as TimelineScheduleItem);
          }
        });

        return [
          {
            groupTitle: 'Pending',
            groupKey: 'pending',
            items: pending.sort(
              (a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
            ),
          },
          {
            groupTitle: 'Completed',
            groupKey: 'completed',
            items: completed.sort(
              (a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
            ),
          },
        ];
      }

      case 'assignee': {
        const byAssignee: Record<string, TimelineScheduleItem[]> = {};
        const unassigned: TimelineScheduleItem[] = [];

        scheduleItems.forEach(item => {
          if (item.assignee_id) {
            const key = `${item.assignee_type}-${item.assignee_id}`;
            if (!byAssignee[key]) {
              byAssignee[key] = [];
            }
            byAssignee[key].push(item as TimelineScheduleItem);
          } else {
            unassigned.push(item as TimelineScheduleItem);
          }
        });

        return [
          ...Object.entries(byAssignee).map(([key, items]) => ({
            groupTitle: `${key.split('-')[0]}: ${key.split('-')[1]}`,
            groupKey: key,
            items: items.sort(
              (a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
            ),
          })),
          {
            groupTitle: 'Unassigned',
            groupKey: 'unassigned',
            items: unassigned.sort(
              (a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
            ),
          },
        ];
      }

      case 'type': {
        const byType: Record<string, TimelineScheduleItem[]> = {};

        scheduleItems.forEach(item => {
          const type = item.object_type || 'unspecified';
          if (!byType[type]) {
            byType[type] = [];
          }
          byType[type].push(item as TimelineScheduleItem);
        });

        return Object.entries(byType).map(([type, items]) => ({
          groupTitle: type.charAt(0).toUpperCase() + type.slice(1),
          groupKey: type,
          items: items.sort(
            (a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
          ),
        }));
      }

      default:
        return [
          {
            groupTitle: 'All Items',
            groupKey: 'all',
            items: [...scheduleItems]
              .map(item => item as TimelineScheduleItem)
              .sort(
                (a, b) =>
                  new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
              ),
          },
        ];
    }
  }, [scheduleItems, groupBy, effectiveStartDate, effectiveEndDate]);

  const formatTimeRange = (item: TimelineScheduleItem) => {
    const startTime = new Date(item.start_datetime);
    const endTime = new Date(item.end_datetime);

    if (item.is_all_day) return 'All Day';

    // If the event spans multiple days
    if (differenceInDays(endTime, startTime) > 0) {
      // If this is a continuation from a previous day
      if (item._isContinuation) {
        return `until ${format(endTime, 'h:mm a')}`;
      }

      // If this continues to the next day
      if (item._continues) {
        return `from ${format(startTime, 'h:mm a')}`;
      }

      // Full date range for multi-day events in the "All" view
      return `${format(startTime, 'MMM d, h:mm a')} - ${format(endTime, 'MMM d, h:mm a')}`;
    }

    // Regular same-day event
    return `${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}`;
  };

  return (
    <div className="timeline-view w-full">
      {groupedItems.map(group => (
        <div key={group.groupKey} className="timeline-group mb-6">
          <h3 className="text-lg font-semibold mb-2">{group.groupTitle}</h3>

          <div className="timeline-items space-y-2">
            {group.items.map(item => (
              <div
                key={`${item.id}-${item._isContinuation ? 'cont' : 'orig'}`}
                className={`
                  timeline-item p-3 rounded-md border
                  ${
                    item.is_completed
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }
                  ${item._isContinuation ? 'border-l-4 border-l-blue-400' : ''}
                  ${item._continues ? 'border-r-4 border-r-blue-400' : ''}
                  cursor-pointer
                `}
                onClick={() => onItemClick && onItemClick(item)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-medium ${item.is_completed ? 'line-through text-green-700' : 'text-slate-900'}`}
                      >
                        {item.title}
                      </span>
                      {item.is_completed && <Check className="h-4 w-4 text-green-600" />}
                    </div>

                    <div className="text-sm text-slate-500 mt-1">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1 inline" />
                        {formatTimeRange(item)}
                      </span>
                    </div>

                    {item.description && (
                      <div className="text-sm text-slate-600 mt-1 line-clamp-2">
                        {item.description}
                      </div>
                    )}
                  </div>

                  {item.assignee_id && (
                    <div className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      {item.assignee_type}: {item.assignee_id}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {group.items.length === 0 && (
              <div className="text-sm text-slate-500 italic p-3 border border-dashed border-slate-200 rounded-md text-center">
                No items for this {groupBy}
              </div>
            )}
          </div>
        </div>
      ))}

      {groupedItems.length === 0 && (
        <div className="text-center p-8 text-slate-500">
          <Calendar className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p className="text-lg">No schedule items available</p>
          <p className="text-sm">Try adding some items to your schedule</p>
        </div>
      )}
    </div>
  );
}

export default TimelineView;
