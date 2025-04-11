
import { Document, DocumentCategory, EntityType } from '../schemas/documentSchema';

/**
 * Get a human-readable category name from a document category
 */
export function getCategoryDisplayName(category: string | DocumentCategory | null | undefined): string {
  if (!category) return 'Other';
  
  // Handle both string and enum type
  const categoryStr = typeof category === 'string' ? category : category.toString();
  
  // Convert from snake_case or lowercase to Title Case
  return categoryStr
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Get appropriate color class for a document category
 */
export function getCategoryColorClass(category: string | DocumentCategory | null | undefined): string {
  if (!category) return 'bg-gray-400';
  
  // Normalize category to string and lowercase for comparison
  const categoryStr = typeof category === 'string' ? category.toLowerCase() : category.toString().toLowerCase();
  
  // Map categories to color classes
  const categoryColors: Record<string, string> = {
    'invoice': 'bg-blue-400',
    'receipt': 'bg-green-400',
    '3rd_party_estimate': 'bg-purple-400',
    'contract': 'bg-amber-400',
    'insurance': 'bg-cyan-400',
    'certification': 'bg-orange-400',
    'photo': 'bg-pink-400',
    'specifications': 'bg-teal-400',
    'permit': 'bg-rose-400',
    'certificate': 'bg-violet-400',
    'general': 'bg-sky-400',
    'other': 'bg-gray-400'
  };
  
  return categoryColors[categoryStr] || 'bg-gray-400';
}

/**
 * Get recommended categories for an entity type
 */
export function getRecommendedCategories(entityType: EntityType): DocumentCategory[] {
  switch (entityType) {
    case EntityType.PROJECT:
      return [
        DocumentCategory.CONTRACT,
        DocumentCategory.PHOTO,
        DocumentCategory.SPECIFICATIONS,
        DocumentCategory.PERMIT
      ];
    case EntityType.WORK_ORDER:
      return [
        DocumentCategory.RECEIPT,
        DocumentCategory.PHOTO,
        DocumentCategory.INVOICE
      ];
    case EntityType.VENDOR:
    case EntityType.SUBCONTRACTOR:
      return [
        DocumentCategory.CONTRACT,
        DocumentCategory.INSURANCE,
        DocumentCategory.CERTIFICATION,
        DocumentCategory.INVOICE
      ];
    case EntityType.EXPENSE:
      return [
        DocumentCategory.RECEIPT,
        DocumentCategory.INVOICE
      ];
    case EntityType.ESTIMATE:
    case EntityType.ESTIMATE_ITEM:
      return [
        DocumentCategory.SPECIFICATIONS,
        DocumentCategory.THIRD_PARTY_ESTIMATE,
        DocumentCategory.CONTRACT
      ];
    default:
      return [
        DocumentCategory.GENERAL,
        DocumentCategory.CONTRACT,
        DocumentCategory.PHOTO,
        DocumentCategory.OTHER
      ];
  }
}

/**
 * Check if a document is a receipt or invoice
 */
export function isFinancialDocument(doc: Document): boolean {
  if (doc.is_expense) return true;
  
  if (doc.category) {
    const category = doc.category.toString().toLowerCase();
    return category === 'receipt' || category === 'invoice';
  }
  
  return false;
}

/**
 * Get category icon name for a document category
 */
export function getCategoryIconName(category: string | DocumentCategory | null | undefined): string {
  if (!category) return 'file';
  
  // Normalize category to string and lowercase for comparison
  const categoryStr = typeof category === 'string' ? category.toLowerCase() : category.toString().toLowerCase();
  
  // Map categories to icon names
  const categoryIcons: Record<string, string> = {
    'invoice': 'file-text',
    'receipt': 'receipt',
    '3rd_party_estimate': 'clipboard-check',
    'contract': 'file-contract',
    'insurance': 'shield',
    'certification': 'certificate',
    'photo': 'image',
    'specifications': 'ruler',
    'permit': 'clipboard',
    'certificate': 'award',
    'general': 'file',
    'other': 'file'
  };
  
  return categoryIcons[categoryStr] || 'file';
}
