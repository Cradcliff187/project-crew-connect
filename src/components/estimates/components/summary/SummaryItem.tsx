import React from 'react';

interface SummaryItemProps {
  label: string;
  value: React.ReactNode;
  isBold?: boolean;
  hasBorderTop?: boolean;
}

const SummaryItem: React.FC<SummaryItemProps> = ({
  label,
  value,
  isBold = false,
  hasBorderTop = false,
}) => {
  return (
    <div className={`flex justify-between ${hasBorderTop ? 'pt-2 border-t' : ''}`}>
      <span className={`${isBold ? 'text-md font-semibold' : 'text-sm text-gray-600'}`}>
        {label}:
      </span>
      <span className={isBold ? 'font-semibold' : 'font-medium'}>{value}</span>
    </div>
  );
};

export default SummaryItem;
