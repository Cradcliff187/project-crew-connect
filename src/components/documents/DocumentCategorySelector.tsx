
import React from 'react';
import { Check, FileText, Receipt, FileBox, Shield, FileImage, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DocumentCategory, documentCategories } from './schemas/documentSchema';
import { Control, Controller } from 'react-hook-form';
import { DocumentUploadFormValues } from './schemas/documentSchema';

interface DocumentCategorySelectorProps {
  control: Control<DocumentUploadFormValues>;
}

const DocumentCategorySelector = ({ control }: DocumentCategorySelectorProps) => {
  const getCategoryIcon = (category: DocumentCategory) => {
    switch (category) {
      case 'invoice':
        return <FileText className="h-5 w-5" />;
      case 'receipt':
        return <Receipt className="h-5 w-5" />;
      case 'estimate':
        return <FileText className="h-5 w-5 text-blue-600" />;
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
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <Controller
      name="metadata.category"
      control={control}
      render={({ field }) => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {documentCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => field.onChange(category)}
              className={cn(
                "flex items-center p-2 border rounded-md transition-colors relative overflow-hidden",
                field.value === category
                  ? "border-[#0485ea] bg-[#0485ea]/5"
                  : "border-border hover:border-[#0485ea]/50 hover:bg-[#0485ea]/5"
              )}
            >
              <div className="mr-2 flex-shrink-0">{getCategoryIcon(category)}</div>
              <span className="truncate text-sm">{getCategoryLabel(category)}</span>
              {field.value === category && (
                <Check className="h-4 w-4 absolute top-1 right-1 text-[#0485ea]" />
              )}
            </button>
          ))}
        </div>
      )}
    />
  );
};

export default DocumentCategorySelector;
