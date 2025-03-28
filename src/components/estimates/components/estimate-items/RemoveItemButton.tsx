
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

interface RemoveItemButtonProps {
  onRemove: () => void;
  showButton: boolean;
}

const RemoveItemButton: React.FC<RemoveItemButtonProps> = ({ onRemove, showButton }) => {
  if (!showButton) return null;
  
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.stopPropagation(); // Prevent collapsible from toggling
        onRemove();
      }}
      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
    >
      <Trash className="h-4 w-4" />
      <span className="sr-only">Remove Item</span>
    </Button>
  );
};

export default RemoveItemButton;
