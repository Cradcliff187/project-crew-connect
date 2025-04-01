
import React from 'react';
import { 
  Receipt, 
  FileText, 
  File, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  FileCheck, 
  Shield, 
  HardHat 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const getCategoryIcon = (category?: string) => {
  switch (category?.toLowerCase()) {
    case 'invoice':
      return <FileText className="h-4 w-4" />;
    case 'receipt':
      return <Receipt className="h-4 w-4" />;
    case '3rd_party_estimate':
      return <FileSpreadsheet className="h-4 w-4" />;
    case 'contract':
      return <FileCheck className="h-4 w-4" />;
    case 'insurance':
      return <Shield className="h-4 w-4" />;
    case 'certification':
      return <HardHat className="h-4 w-4" />;
    case 'photo':
      return <ImageIcon className="h-4 w-4" />;
    default:
      return <File className="h-4 w-4" />;
  }
};

export const getCategoryName = (category?: string): string => {
  if (!category) return 'Other';
  
  switch (category.toLowerCase()) {
    case 'invoice':
      return 'Invoice';
    case 'receipt':
      return 'Receipt';
    case '3rd_party_estimate':
      return '3rd Party Estimate';
    case 'contract':
      return 'Contract';
    case 'insurance':
      return 'Insurance';
    case 'certification':
      return 'Certification';
    case 'photo':
      return 'Photo';
    default:
      return category.charAt(0).toUpperCase() + category.slice(1);
  }
};

export const getCategoryColor = (category?: string): string => {
  switch (category?.toLowerCase()) {
    case 'invoice':
      return 'text-blue-500';
    case 'receipt':
      return 'text-green-500';
    case '3rd_party_estimate':
      return 'text-purple-500';
    case 'contract':
      return 'text-amber-500';
    case 'insurance':
      return 'text-red-500';
    case 'certification':
      return 'text-orange-500';
    case 'photo':
      return 'text-cyan-500';
    default:
      return 'text-gray-500';
  }
};

interface DocumentCategoryBadgeProps {
  category?: string;
}

export const DocumentCategoryBadge: React.FC<DocumentCategoryBadgeProps> = ({ category }) => {
  if (!category) return null;
  
  const Icon = getCategoryIcon(category);
  const name = getCategoryName(category);
  
  return (
    <Badge variant="outline" className="flex items-center gap-1 text-xs font-normal">
      {React.cloneElement(Icon as React.ReactElement, { 
        className: `h-3 w-3 ${getCategoryColor(category)}`
      })}
      <span>{name}</span>
    </Badge>
  );
};
