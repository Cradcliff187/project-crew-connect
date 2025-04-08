
import React from 'react';
import { Receipt, FileText, Image, FileCog, FileSpreadsheet, FileBox, FileQuestion } from 'lucide-react';

// Document category types
export type DocumentCategory = 'receipt' | 'invoice' | 'photo' | 'contract' | 'spreadsheet' | 'report' | 'specification' | 'certification' | string;

// Icon mapping for document categories
export const CategoryIcons = {
  receipt: Receipt,
  invoice: Receipt,
  photo: Image,
  contract: FileText,
  spreadsheet: FileSpreadsheet,
  report: FileText,
  specification: FileCog,
  certification: FileBox,
  default: FileQuestion
};

// Get icon for a specific category
export const getCategoryIcon = (category: string) => {
  const Icon = CategoryIcons[category as keyof typeof CategoryIcons] || CategoryIcons.default;
  return Icon;
};

// Badge component for document categories
export const DocumentCategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  const Icon = getCategoryIcon(category);
  
  // Determine badge color based on category
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  
  switch (category) {
    case 'receipt':
    case 'invoice':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'photo':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      break;
    case 'contract':
      bgColor = 'bg-purple-100';
      textColor = 'text-purple-800';
      break;
    case 'certification':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      break;
    case 'specification':
    case 'report':
      bgColor = 'bg-indigo-100';
      textColor = 'text-indigo-800';
      break;
  }
  
  return (
    <div className={`flex items-center gap-1 ${bgColor} ${textColor} rounded px-1 py-0.5 text-xs`}>
      <Icon className="h-3 w-3" />
      <span className="capitalize">
        {category}
      </span>
    </div>
  );
};
