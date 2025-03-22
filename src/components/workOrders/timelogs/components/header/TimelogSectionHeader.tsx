
import TimelogAddButton from './TimelogAddButton';

interface TimelogSectionHeaderProps {
  onAddClick: () => void;
}

const TimelogSectionHeader = ({ onAddClick }: TimelogSectionHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold text-[#0485ea]">Work Order Time Tracking</h2>
      <TimelogAddButton onClick={onAddClick} />
    </div>
  );
};

export default TimelogSectionHeader;
