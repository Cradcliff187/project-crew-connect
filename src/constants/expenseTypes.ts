/**
 * Centralized expense type and document category definitions
 * This file serves as the single source of truth for all expense types and document categories
 * throughout the application.
 */

// Standard expense types - used across the application
export const EXPENSE_TYPES = [
  { value: 'material', label: 'Material' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'tools', label: 'Tools' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'labor', label: 'Labor' },
  { value: 'subcontractor', label: 'Subcontractor' },
  { value: 'permit', label: 'Permit' },
  { value: 'travel', label: 'Travel' },
  { value: 'office', label: 'Office' },
  { value: 'utility', label: 'Utility' },
  { value: 'other', label: 'Other' },
] as const;

// Type for expense type values
export type ExpenseType = (typeof EXPENSE_TYPES)[number]['value'];

// Array of just the values for simpler imports
export const EXPENSE_TYPE_VALUES = EXPENSE_TYPES.map(t => t.value);

// Document categories - both financial and non-financial
export const DOCUMENT_CATEGORIES = [
  // Financial documents
  { value: 'invoice', label: 'Invoice', isFinancial: true },
  { value: 'receipt', label: 'Receipt', isFinancial: true },

  // Legal documents
  { value: 'contract', label: 'Contract', isFinancial: false },
  { value: 'insurance', label: 'Insurance', isFinancial: false },
  { value: 'certification', label: 'Certification', isFinancial: false },
  { value: 'permit_document', label: 'Permit', isFinancial: false },

  // Project documents
  { value: '3rd_party_estimate', label: 'Third-Party Estimate', isFinancial: true },
  { value: 'drawing', label: 'Drawing/Plan', isFinancial: false },
  { value: 'photo', label: 'Photo', isFinancial: false },
  { value: 'specification', label: 'Specification', isFinancial: false },

  // Other
  { value: 'correspondence', label: 'Correspondence', isFinancial: false },
  { value: 'report', label: 'Report', isFinancial: false },
  { value: 'other', label: 'Other', isFinancial: false },
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number]['value'];

// Map which expense types require vendor selection
export const EXPENSE_TYPE_RELATIONS = {
  material: { requiresVendor: true, allowsSubcontractor: false },
  equipment: { requiresVendor: true, allowsSubcontractor: false },
  tools: { requiresVendor: true, allowsSubcontractor: false },
  supplies: { requiresVendor: true, allowsSubcontractor: false },
  labor: { requiresVendor: false, allowsSubcontractor: true },
  subcontractor: { requiresVendor: false, allowsSubcontractor: true },
  permit: { requiresVendor: false, allowsSubcontractor: false },
  travel: { requiresVendor: false, allowsSubcontractor: false },
  office: { requiresVendor: false, allowsSubcontractor: false },
  utility: { requiresVendor: true, allowsSubcontractor: false },
  other: { requiresVendor: false, allowsSubcontractor: false },
} as const;

// Helper functions

// Check if expense type requires a vendor
export const expenseTypeRequiresVendor = (expenseType: string): boolean => {
  return (
    EXPENSE_TYPE_RELATIONS[expenseType as keyof typeof EXPENSE_TYPE_RELATIONS]?.requiresVendor ||
    false
  );
};

// Check if expense type allows a subcontractor
export const expenseTypeAllowsSubcontractor = (expenseType: string): boolean => {
  return (
    EXPENSE_TYPE_RELATIONS[expenseType as keyof typeof EXPENSE_TYPE_RELATIONS]
      ?.allowsSubcontractor || false
  );
};

// Maps budget categories to expense types
export const mapBudgetCategoryToExpenseType = (category: string): ExpenseType => {
  const normalized = category.toLowerCase();

  if (normalized.includes('material')) return 'material';
  if (normalized.includes('labor')) return 'labor';
  if (normalized.includes('subcontractor')) return 'subcontractor';
  if (normalized.includes('equipment')) return 'equipment';
  if (normalized.includes('permit')) return 'permit';
  if (normalized.includes('overhead')) return 'office';
  if (normalized.includes('conting')) return 'other';

  return 'other';
};

// Maps expense types to budget categories
export const mapExpenseTypeToBudgetCategory = (expenseType: ExpenseType): string => {
  switch (expenseType) {
    case 'material':
      return 'Materials';
    case 'equipment':
      return 'Equipment';
    case 'tools':
      return 'Equipment';
    case 'supplies':
      return 'Materials';
    case 'labor':
      return 'Labor';
    case 'subcontractor':
      return 'Subcontractors';
    case 'permit':
      return 'Permits';
    case 'utility':
      return 'Overhead';
    case 'office':
      return 'Overhead';
    case 'travel':
      return 'Overhead';
    default:
      return 'Other';
  }
};

// Get all financial document categories
export const getFinancialDocumentCategories = (): DocumentCategory[] => {
  return DOCUMENT_CATEGORIES.filter(cat => cat.isFinancial).map(cat => cat.value);
};

// Get all non-financial document categories
export const getNonFinancialDocumentCategories = (): DocumentCategory[] => {
  return DOCUMENT_CATEGORIES.filter(cat => !cat.isFinancial).map(cat => cat.value);
};
