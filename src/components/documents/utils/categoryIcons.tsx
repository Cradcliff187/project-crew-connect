
import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Receipt,
  FileText,
  FileContract,
  Camera,
  FileQuestion,
  FileCode,
  Stamp,
  Award,
  FileWarning,
  FileSearch,
  Shield,
  Medal
} from 'lucide-react';

interface DocumentCategoryBadgeProps {
  category: string;
}

export const DocumentCategoryBadge: React.FC<DocumentCategoryBadgeProps> = ({ category }) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'receipt':
        return 'bg-green-100 text-green-700 hover:bg-green-200';
      case 'invoice':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
      case 'contract':
        return 'bg-purple-100 text-purple-700 hover:bg-purple-200';
      case 'photo':
        return 'bg-amber-100 text-amber-700 hover:bg-amber-200';
      case 'specifications':
        return 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200';
      case 'permit':
        return 'bg-red-100 text-red-700 hover:bg-red-200';
      case 'certificate':
        return 'bg-teal-100 text-teal-700 hover:bg-teal-200';
      case '3rd_party_estimate':
        return 'bg-orange-100 text-orange-700 hover:bg-orange-200';
      case 'insurance':
        return 'bg-sky-100 text-sky-700 hover:bg-sky-200';
      case 'certification':
        return 'bg-lime-100 text-lime-700 hover:bg-lime-200';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'receipt':
        return <Receipt className="h-3 w-3 mr-1" />;
      case 'invoice':
        return <FileText className="h-3 w-3 mr-1" />;
      case 'contract':
        return <FileContract className="h-3 w-3 mr-1" />;
      case 'photo':
        return <Camera className="h-3 w-3 mr-1" />;
      case 'specifications':
        return <FileCode className="h-3 w-3 mr-1" />;
      case 'permit':
        return <Stamp className="h-3 w-3 mr-1" />;
      case 'certificate':
        return <Award className="h-3 w-3 mr-1" />;
      case '3rd_party_estimate':
        return <FileSearch className="h-3 w-3 mr-1" />;
      case 'insurance':
        return <Shield className="h-3 w-3 mr-1" />;
      case 'certification':
        return <Medal className="h-3 w-3 mr-1" />;
      default:
        return <FileQuestion className="h-3 w-3 mr-1" />;
    }
  };

  const formattedCategory = category.replace(/_/g, ' ');
  
  return (
    <Badge 
      className={`${getCategoryColor(category)} font-normal flex items-center`}
      variant="outline"
    >
      {getCategoryIcon(category)}
      {formattedCategory}
    </Badge>
  );
};
