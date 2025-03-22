
import React from 'react';
import { DollarSign, Timer } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface CostDisplayProps {
  hoursWorked: number;
  selectedEmployeeRate: number | null;
  startTime: string;
  endTime: string;
}

const CostDisplay: React.FC<CostDisplayProps> = ({
  hoursWorked,
  selectedEmployeeRate,
  startTime,
  endTime
}) => {
  const laborCost = hoursWorked * (selectedEmployeeRate || 75);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="hoursWorked">Total Hours</Label>
        <Input
          id="hoursWorked"
          type="number"
          step="0.01"
          readOnly
          value={hoursWorked}
          className="bg-muted"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="laborCost">Estimated Labor Cost</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
          </span>
          <Input
            id="laborCost"
            type="text"
            readOnly
            value={laborCost.toFixed(2)}
            className="bg-muted pl-9"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          Based on {selectedEmployeeRate ? `$${selectedEmployeeRate.toFixed(2)}` : '$75.00'}/hr
        </div>
      </div>
    </div>
  );
};

export default CostDisplay;
