
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { expenseTypes } from '../schemas/documentSchema';

interface ExpenseTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const ExpenseTypeSelector: React.FC<ExpenseTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      className="flex flex-col space-y-1"
    >
      {expenseTypes.map((type) => (
        <div key={type} className="flex items-center space-x-2">
          <RadioGroupItem value={type} id={`expense-type-${type}`} />
          <Label htmlFor={`expense-type-${type}`} className="capitalize">
            {type}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
};

export default ExpenseTypeSelector;
