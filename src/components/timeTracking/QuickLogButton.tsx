
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Clock } from 'lucide-react';

interface QuickLogButtonProps {
  onQuickLog: () => void;
}

const QuickLogButton: React.FC<QuickLogButtonProps> = ({ onQuickLog }) => {
  return (
    <Button 
      onClick={onQuickLog}
      className="w-full flex items-center justify-center gap-2 bg-[#0485ea] hover:bg-[#0375d1] font-medium"
    >
      <Clock className="h-4 w-4" />
      Quick Time Entry
    </Button>
  );
};

export default QuickLogButton;
