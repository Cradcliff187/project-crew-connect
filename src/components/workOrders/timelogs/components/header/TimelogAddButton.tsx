
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimelogAddButtonProps {
  onClick: () => void;
}

const TimelogAddButton = ({ onClick }: TimelogAddButtonProps) => {
  return (
    <Button 
      onClick={onClick} 
      size="sm" 
      className="bg-[#0485ea] hover:bg-[#0375d1]"
    >
      <Plus className="h-4 w-4 mr-1" /> Log Time
    </Button>
  );
};

export default TimelogAddButton;
