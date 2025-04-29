import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AddMaterialButtonProps {
  onClick: () => void;
}

const AddMaterialButton = ({ onClick }: AddMaterialButtonProps) => {
  return (
    <Button size="sm" onClick={onClick}>
      <Plus className="h-4 w-4 mr-2" />
      Add Material
    </Button>
  );
};

export default AddMaterialButton;
