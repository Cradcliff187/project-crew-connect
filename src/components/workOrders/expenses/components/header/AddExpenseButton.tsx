import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AddExpenseButtonProps {
  onClick: () => void;
}

const AddExpenseButton = ({ onClick }: AddExpenseButtonProps) => {
  return (
    <Button onClick={onClick}>
      <Plus className="h-4 w-4 mr-2" />
      Add Expense
    </Button>
  );
};

export default AddExpenseButton;
