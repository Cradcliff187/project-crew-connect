import React from 'react';
import { Check, FileText, Receipt, FileBox, Shield, FileImage, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DocumentCategory, documentCategories } from './schemas/documentSchema';

interface DocumentCategorySelectorProps {
  value: DocumentCategory;
  onChange: (category: DocumentCategory) => void;
  className?: string;
}

const DocumentCategorySelector = ({
  value,
  onChange,
  className,
}: DocumentCategorySelectorProps) => {
  const getCategoryIcon = (category: DocumentCategory) => {
    switch (category) {
      case 'invoice':
        return <FileText className="h-5 w-5" />;
      case 'receipt':
        return <Receipt className="h-5 w-5" />;
      case '3rd_party_estimate':
        return <FileText className="h-5 w-5 text-construction-600" />;
      case 'contract':
        return <FileBox className="h-5 w-5" />;
      case 'insurance':
      case 'certification':
        return <Shield className="h-5 w-5" />;
      case 'photo':
        return <FileImage className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  const getCategoryLabel = (category: DocumentCategory) => {
    if (category === '3rd_party_estimate') return 'Estimate';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-2', className)}>
      {documentCategories.map(category => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(category)}
          className={cn(
            'flex items-center p-2 border rounded-md transition-colors relative overflow-hidden',
            value === category
              ? 'border-construction-300 bg-construction-50'
              : 'border-border hover:border-construction-200 hover:bg-warmgray-50'
          )}
        >
          <div className="mr-2 flex-shrink-0">{getCategoryIcon(category)}</div>
          <span className="truncate text-sm">{getCategoryLabel(category)}</span>
          {value === category && (
            <Check className="h-4 w-4 absolute top-1 right-1 text-construction-600" />
          )}
        </button>
      ))}
    </div>
  );
};

export default DocumentCategorySelector;
