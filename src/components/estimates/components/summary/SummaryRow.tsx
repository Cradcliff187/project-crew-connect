
import React from 'react';

interface SummaryRowProps {
  label: string;
  value: string | React.ReactNode;
  isBold?: boolean;
  hasBorder?: boolean;
}

const SummaryRow: React.FC<SummaryRowProps> = ({ 
  label, 
  value, 
  isBold = false,
  hasBorder = false
}) => {
  return (
    <div className={`flex justify-between ${hasBorder ? 'pt-2 border-t' : 'py-2'}`}>
      <span className={`text-sm ${isBold ? 'font-semibold text-md' : 'text-gray-600'}`}>{label}</span>
      <span className={isBold ? 'font-semibold' : 'font-medium'}>{value}</span>
    </div>
  );
};

export default SummaryRow;
