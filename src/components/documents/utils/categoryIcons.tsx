import {
  FileText,
  Receipt,
  FileCheck,
  Landmark,
  Image,
  FileSignature,
  ShieldCheck,
  LucideIcon,
} from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface CategoryConfig {
  icon: LucideIcon;
  label: string;
  color: string;
}

const defaultConfig: CategoryConfig = {
  icon: FileText,
  label: 'Document',
  color: '#6b7280', // Gray-500
};

const categoryConfigs: Record<string, CategoryConfig> = {
  invoice: {
    icon: FileSignature,
    label: 'Invoice',
    color: '#0284c7', // Sky-600
  },
  receipt: {
    icon: Receipt,
    label: 'Receipt',
    color: '#ea580c', // Orange-600
  },
  '3rd_party_estimate': {
    icon: FileCheck,
    label: 'Third Party Estimate',
    color: '#16a34a', // Green-600
  },
  contract: {
    icon: FileSignature,
    label: 'Contract',
    color: '#7c3aed', // Violet-600
  },
  insurance: {
    icon: ShieldCheck,
    label: 'Insurance',
    color: '#0891b2', // Cyan-600
  },
  certification: {
    icon: Landmark,
    label: 'Certification',
    color: '#be123c', // Rose-700
  },
  photo: {
    icon: Image,
    label: 'Photo',
    color: '#0369a1', // Sky-700
  },
  other: {
    icon: FileText,
    label: 'Other Document',
    color: '#6b7280', // Gray-500
  },
};

export const getCategoryConfig = (category: string): CategoryConfig => {
  if (!category) return defaultConfig;
  return categoryConfigs[category.toLowerCase()] || defaultConfig;
};

interface DocumentCategoryBadgeProps {
  category: string;
  showLabel?: boolean;
}

export const DocumentCategoryBadge: React.FC<DocumentCategoryBadgeProps> = ({
  category,
  showLabel = false,
}) => {
  const config = getCategoryConfig(category);
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className="text-xs font-normal px-2 py-0.5 h-auto"
      style={{
        borderColor: config.color,
        color: config.color,
      }}
    >
      <Icon className="h-3 w-3 mr-1" />
      {showLabel ? config.label : category.charAt(0).toUpperCase() + category.slice(1)}
    </Badge>
  );
};
