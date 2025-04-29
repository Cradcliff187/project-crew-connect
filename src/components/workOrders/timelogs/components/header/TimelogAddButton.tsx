import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface TimelogAddButtonProps {
  onClick: () => void;
}

const TimelogAddButton = ({ onClick }: TimelogAddButtonProps) => {
  return (
    <Button onClick={onClick}>
      <Plus className="h-4 w-4 mr-1" />
      Log Time
    </Button>
  );
};

export default TimelogAddButton;
