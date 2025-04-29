import { Package2 } from 'lucide-react';
import { AddMaterialButton } from './';

interface SectionHeaderProps {
  onAddClick: () => void;
}

const SectionHeader = ({ onAddClick }: SectionHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
        <Package2 className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium">Work Order Materials</h3>
      </div>
      <AddMaterialButton onClick={onAddClick} />
    </div>
  );
};

export default SectionHeader;
