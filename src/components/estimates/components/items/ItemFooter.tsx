
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

interface ItemFooterProps {
  onRemove: () => void;
  canRemove: boolean;
}

const ItemFooter = ({ onRemove, canRemove }: ItemFooterProps) => {
  if (!canRemove) return null;
  
  return (
    <div className="col-span-12 flex justify-end">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="text-red-500 hover:text-red-700 hover:bg-red-50"
      >
        <Trash className="h-4 w-4 mr-1" />
        Remove Item
      </Button>
    </div>
  );
};

export default ItemFooter;
