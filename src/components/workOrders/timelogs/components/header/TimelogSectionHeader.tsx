
import { Button } from '@/components/ui/button';
import { Plus, Clock } from 'lucide-react';

interface TimelogSectionHeaderProps {
  onAddClick: () => void;
}

const TimelogSectionHeader = ({ onAddClick }: TimelogSectionHeaderProps) => {
  return (
    <div className="flex justify-between items-center bg-[#0485ea]/10 p-4 rounded-md">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-[#0485ea]" />
        <h3 className="text-base font-medium">Time Tracking</h3>
      </div>
      <Button 
        onClick={onAddClick}
        className="bg-[#0485ea] hover:bg-[#0375d1]"
        size="sm"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Time Entry
      </Button>
    </div>
  );
};

export default TimelogSectionHeader;
