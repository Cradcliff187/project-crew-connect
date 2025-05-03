import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, Circle, Clock } from 'lucide-react';

export interface TimelinePoint {
  date: Date | string | null;
  label: string;
  status: 'past' | 'current' | 'future' | 'overdue';
}

interface TimelineDisplayProps {
  points: TimelinePoint[];
  className?: string;
}

export const TimelineDisplay = ({ points, className }: TimelineDisplayProps) => {
  return (
    <div className={cn('space-y-1', className)}>
      {points.map((point, index) => {
        const isLast = index === points.length - 1;
        const formattedDate =
          typeof point.date === 'string'
            ? point.date
            : point.date
              ? new Date(point.date).toLocaleDateString()
              : 'TBD';

        return (
          <div key={point.label} className="relative pl-7">
            {/* Status Icon */}
            <div className="absolute left-0 top-0.5">
              {point.status === 'past' && <CheckCircle className="h-5 w-5 text-green-500" />}
              {point.status === 'current' && <Clock className="h-5 w-5 text-primary" />}
              {point.status === 'future' && <Circle className="h-5 w-5 text-muted-foreground" />}
              {point.status === 'overdue' && <Clock className="h-5 w-5 text-destructive" />}
            </div>

            {/* Timeline Line */}
            {!isLast && <div className="absolute left-2.5 top-5 bottom-0 w-px bg-border h-full" />}

            {/* Content */}
            <div className="space-y-0.5">
              <p className="text-xs font-medium">{point.label}</p>
              <p
                className={cn(
                  'text-sm',
                  point.status === 'overdue' ? 'text-destructive' : 'text-muted-foreground'
                )}
              >
                {formattedDate}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TimelineDisplay;
