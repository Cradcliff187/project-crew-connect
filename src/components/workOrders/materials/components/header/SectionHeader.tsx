
import AddMaterialButton from './AddMaterialButton';

interface SectionHeaderProps {
  onAddClick: () => void;
}

const SectionHeader = ({ onAddClick }: SectionHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold text-[#0485ea]">Work Order Materials</h2>
      <AddMaterialButton onClick={onAddClick} />
    </div>
  );
};

export default SectionHeader;
