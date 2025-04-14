import { CardHeader, CardTitle } from '@/components/ui/card';
import { TimelogAddButton } from '.';

interface TimelogSectionHeaderProps {
  onAddClick: () => void;
}

const TimelogSectionHeader = ({ onAddClick }: TimelogSectionHeaderProps) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-lg">Time Tracking</CardTitle>
      <TimelogAddButton onClick={onAddClick} />
    </CardHeader>
  );
};

export default TimelogSectionHeader;
