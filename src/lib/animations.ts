// Animation utility functions for document components
import { cn } from '@/lib/utils';

// Animation classes for document cards
export const documentCardAnimations = {
  enter: 'transition-all duration-300 ease-in-out',
  hover: 'hover:shadow-md hover:translate-y-[-2px] hover:border-[#0485ea]/50',
  active: 'active:scale-[0.98]',
  selected: 'ring-2 ring-[#0485ea] border-[#0485ea] bg-blue-50/30',
};

// Animation classes for document lists and grids
export const documentListAnimations = {
  container: 'transition-all duration-200',
  item: 'animate-fade-in',
};

// Animation classes for document viewers and modals
export const viewerAnimations = {
  overlay: 'animate-fade-in',
  content: 'animate-scale-in',
  exit: 'animate-fade-out',
};

// Helper to generate animated classnames
export const getAnimatedClasses = (baseClasses: string, animationClasses: string): string => {
  return cn(baseClasses, animationClasses);
};

// Document group color mapping
export const groupColors = {
  default: '#0485ea',
  contracts: '#22c55e',
  invoices: '#f59e0b',
  receipts: '#ef4444',
  specifications: '#8b5cf6',
  photos: '#06b6d4',
  other: '#64748b',
};

// Get color for document category
export const getDocumentCategoryColor = (category?: string): string => {
  if (!category) return groupColors.default;

  const lowerCategory = category.toLowerCase();

  for (const [key, value] of Object.entries(groupColors)) {
    if (lowerCategory.includes(key)) {
      return value;
    }
  }

  return groupColors.default;
};
