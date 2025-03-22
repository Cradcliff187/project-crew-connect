
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface TimelogAddButtonProps {
  onClick: () => void;
}

const TimelogAddButton = ({ onClick }: TimelogAddButtonProps) => {
  return (
    <Button 
      className="bg-[#0485ea] hover:bg-[#0375d1]"
      size="sm"
      onClick={onClick}
    >
      <Plus className="h-4 w-4 mr-1" />
      Add Time Log
    </Button>
  );
};

export default TimelogAddButton;
