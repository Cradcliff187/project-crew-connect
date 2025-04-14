import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AddMaterialButtonProps {
  onClick: () => void;
}

const AddMaterialButton = ({ onClick }: AddMaterialButtonProps) => {
  return (
    <Button className="bg-[#0485ea] hover:bg-[#0375d1]" size="sm" onClick={onClick}>
      <Plus className="h-4 w-4 mr-1" />
      Add Material
    </Button>
  );
};

export default AddMaterialButton;
