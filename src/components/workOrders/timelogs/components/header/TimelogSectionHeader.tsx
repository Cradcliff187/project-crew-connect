
import { Clock } from 'lucide-react';
import { TimelogAddButton } from './';

interface TimelogSectionHeaderProps {
  onAddClick: () => void;
}

const TimelogSectionHeader = ({ onAddClick }: TimelogSectionHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-[#0485ea]" />
        <h3 className="text-lg font-medium">Work Order Time Tracking</h3>
      </div>
      <TimelogAddButton onClick={onAddClick} />
    </div>
  );
};

export default TimelogSectionHeader;
