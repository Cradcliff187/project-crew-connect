import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

// TODO: Define necessary props (e.g., project dates, milestone dates)
interface UpcomingDatesCardProps {}

const UpcomingDatesCard: React.FC<UpcomingDatesCardProps> = props => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Dates</CardTitle>
      </CardHeader>
      <CardContent>
        {/* TODO: Implement card content based on props */}
        <p>Start Date: [Data]</p>
        <p>Target End: [Data]</p>
        {/* Add milestone dates? */}
      </CardContent>
    </Card>
  );
};

export default UpcomingDatesCard;
