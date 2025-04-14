import { DollarSign } from 'lucide-react';
import { AddExpenseButton } from './';

interface SectionHeaderProps {
  onAddClick: () => void;
}

const SectionHeader = ({ onAddClick }: SectionHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-[#0485ea]" />
        <h3 className="text-lg font-medium">Work Order Expenses</h3>
      </div>
      <AddExpenseButton onClick={onAddClick} />
    </div>
  );
};

export default SectionHeader;
