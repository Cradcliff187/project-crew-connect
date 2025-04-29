import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Clock } from 'lucide-react';

interface QuickLogButtonProps {
  onQuickLog: () => void;
}

const QuickLogButton = ({ onQuickLog }: QuickLogButtonProps) => {
  return (
    <Button
      className="w-full flex items-center justify-center gap-2 font-medium"
      size="lg"
      onClick={onQuickLog}
    >
      <Clock className="h-4 w-4" />
      Quick Time Entry
    </Button>
  );
};

export default QuickLogButton;
