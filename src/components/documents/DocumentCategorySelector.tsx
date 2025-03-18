
import React from 'react';
import { Check, FileText, Receipt, FileContract, Shield, FileImage, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DocumentCategory, documentCategories } from './schemas/documentSchema';

interface DocumentCategorySelectorProps {
  value: DocumentCategory;
  onChange: (category: DocumentCategory) => void;
  className?: string;
}

const DocumentCategorySelector = ({ value, onChange, className }: DocumentCategorySelectorProps) => {
  const getCategoryIcon = (category: DocumentCategory) => {
    switch (category) {
      case 'invoice':
        return <FileText className="h-5 w-5" />;
      case 'receipt':
        return <Receipt className="h-5 w-5" />;
      case 'estimate':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'contract':
        return <FileContract className="h-5 w-5" />;
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
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-2", className)}>
      {documentCategories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(category)}
          className={cn(
            "flex items-center p-2 border rounded-md transition-colors relative",
            value === category
              ? "border-[#0485ea] bg-[#0485ea]/5"
              : "border-border hover:border-[#0485ea]/50 hover:bg-[#0485ea]/5"
          )}
        >
          <div className="mr-2">{getCategoryIcon(category)}</div>
          <span>{getCategoryLabel(category)}</span>
          {value === category && (
            <Check className="h-4 w-4 absolute top-1 right-1 text-[#0485ea]" />
          )}
        </button>
      ))}
    </div>
  );
};

export default DocumentCategorySelector;
