
import { Clock } from 'lucide-react';

interface TotalHoursDisplayProps {
  totalHours: number;
}

const TotalHoursDisplay = ({ totalHours }: TotalHoursDisplayProps) => {
  return (
    <div className="flex justify-between items-center bg-gray-50 p-4 border rounded-md mt-4">
      <div className="flex items-center gap-2 text-gray-600">
        <Clock size={18} />
        <span className="font-medium">Total Hours Logged</span>
      </div>
      <div className="bg-[#0485ea]/10 px-4 py-2 rounded-md">
        <span className="text-lg font-bold text-[#0485ea]">{totalHours.toFixed(1)} hrs</span>
      </div>
    </div>
  );
};

export default TotalHoursDisplay;
