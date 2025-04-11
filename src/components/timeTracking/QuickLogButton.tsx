
import React from 'react';
import { Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickLogButtonProps {
  onQuickLog: () => void;
}

const QuickLogButton: React.FC<QuickLogButtonProps> = ({ onQuickLog }) => {
  return (
    <Button 
      onClick={onQuickLog}
      className="w-full bg-[#0485ea] hover:bg-[#0375d1] flex items-center justify-center text-white py-3 h-auto"
    >
      <Clock className="h-5 w-5 mr-2" />
      <span className="font-medium">Quick Log Time</span>
      <Plus className="h-4 w-4 ml-2" />
    </Button>
  );
};

export default QuickLogButton;
