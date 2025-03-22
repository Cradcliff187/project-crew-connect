
import { Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface TotalHoursDisplayProps {
  totalHours: number;
}

const TotalHoursDisplay = ({ totalHours }: TotalHoursDisplayProps) => {
  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-[#0485ea]" />
            <span className="font-medium">Total Hours</span>
          </div>
          <div className="text-lg font-bold">{totalHours.toFixed(2)}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TotalHoursDisplay;
