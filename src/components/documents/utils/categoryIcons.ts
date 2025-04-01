
import { FileText, Receipt, LucideIcon, FileImage, FileBadge, Shield, Award, File } from 'lucide-react';

export type DocumentCategoryType = 
  | 'invoice' 
  | 'receipt' 
  | '3rd_party_estimate' 
  | 'contract' 
  | 'insurance' 
  | 'certification' 
  | 'photo' 
  | 'other';

export interface CategoryIconConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  label: string;
}

/**
 * Maps document categories to their visual representation
 * including icons, colors, and display labels
 */
export const categoryIcons: Record<DocumentCategoryType, CategoryIconConfig> = {
  'invoice': {
    icon: FileText,
    color: '#0485ea',
    bgColor: '#e6f2ff',
    label: 'Invoice'
  },
  'receipt': {
    icon: Receipt,
    color: '#16a34a',
    bgColor: '#dcfce7',
    label: 'Receipt'
  },
  '3rd_party_estimate': {
    icon: FileBadge,
    color: '#9333ea',
    bgColor: '#f3e8ff',
    label: 'Third Party Estimate'
  },
  'contract': {
    icon: FileText,
    color: '#ea580c',
    bgColor: '#fff1e6',
    label: 'Contract'
  },
  'insurance': {
    icon: Shield,
    color: '#0891b2',
    bgColor: '#e0f2fe',
    label: 'Insurance'
  },
  'certification': {
    icon: Award,
    color: '#ca8a04',
    bgColor: '#fef9c3',
    label: 'Certification'
  },
  'photo': {
    icon: FileImage,
    color: '#db2777',
    bgColor: '#fce7f3',
    label: 'Photo'
  },
  'other': {
    icon: File,
    color: '#64748b',
    bgColor: '#f1f5f9',
    label: 'Other'
  }
};

/**
 * Get category configuration for a given category
 * Falls back to 'other' if category doesn't exist
 */
export const getCategoryConfig = (category?: string): CategoryIconConfig => {
  if (!category) return categoryIcons.other;
  
  return categoryIcons[category as DocumentCategoryType] || categoryIcons.other;
};

/**
 * Component that renders a category badge with icon and color
 */
export const DocumentCategoryBadge = ({ category }: { category?: string }) => {
  const config = getCategoryConfig(category);
  const Icon = config.icon;
  
  return (
    <div 
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: config.bgColor, color: config.color }}
    >
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </div>
  );
};
