
import React from 'react';
import { Button } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface CopyTotalButtonProps {
  grandTotal: number;
}

const CopyTotalButton: React.FC<CopyTotalButtonProps> = ({ grandTotal }) => {
  return (
    <TooltipProvider>
      <div className="flex justify-end">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              type="button" 
              variant="outline" 
              className="text-sm"
              onClick={() => {
                navigator.clipboard.writeText(grandTotal.toFixed(2));
              }}
            >
              Copy Total
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy total amount to clipboard</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default CopyTotalButton;
