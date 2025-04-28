import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { differenceInDays, formatDistanceToNowStrict } from 'date-fns';
import { CalendarDays } from 'lucide-react';

interface UpcomingDatesCardProps {
  startDate?: string | null;
  targetEndDate?: string | null;
}

const UpcomingDatesCard: React.FC<UpcomingDatesCardProps> = ({ startDate, targetEndDate }) => {
  const renderDate = (dateString: string | null | undefined, label: string) => {
    if (!dateString) {
      return <p>{label}: TBD</p>;
    }
    try {
      const date = new Date(dateString);
      return (
        <p>
          {label}: {formatDate(date.toISOString())}
        </p>
      );
    } catch (e) {
      console.error('Error parsing date:', dateString, e);
      return <p>{label}: Invalid Date</p>;
    }
  };

  const renderTimeDifference = () => {
    if (!targetEndDate) return null;

    try {
      const endDate = new Date(targetEndDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Compare dates only
      endDate.setHours(0, 0, 0, 0);

      const daysDiff = differenceInDays(endDate, today);

      if (daysDiff < 0) {
        return (
          <p className="text-sm text-red-600">
            {formatDistanceToNowStrict(endDate, { addSuffix: true })} (Overdue)
          </p>
        );
      } else if (daysDiff === 0) {
        return <p className="text-sm text-blue-600">Due today</p>;
      } else {
        return (
          <p className="text-sm text-muted-foreground">
            Due in {formatDistanceToNowStrict(endDate)}
          </p>
        );
      }
    } catch (e) {
      console.error('Error calculating date difference:', targetEndDate, e);
      return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium flex items-center">
          <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
          Key Dates
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-1 pt-2">
        {renderDate(startDate, 'Start Date')}
        {renderDate(targetEndDate, 'Target End')}
        {renderTimeDifference()}
      </CardContent>
    </Card>
  );
};

export default UpcomingDatesCard;
