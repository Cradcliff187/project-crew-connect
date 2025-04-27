import * as z from 'zod';
import {
  EXPENSE_TYPE_VALUES,
  EXPENSE_TYPE_RELATIONS,
  expenseTypeRequiresVendor as requiresVendor,
  expenseTypeAllowsSubcontractor as allowsSubcontractor,
  DOCUMENT_CATEGORIES,
} from '@/constants/expenseTypes';

// Define the category options
export const documentCategories = [
  'invoice',
  'receipt',
  '3rd_party_estimate',
  'contract',
  'insurance',
  'certification',
  'photo',
  'drawing',
  'specification',
  'permit_document',
  'correspondence',
  'report',
  'other',
] as const;

// Define the entity types that documents can be related to
export const entityTypes = [
  'PROJECT',
  'CUSTOMER',
  'ESTIMATE',
  'WORK_ORDER',
  'VENDOR',
  'SUBCONTRACTOR',
  'EXPENSE',
  'TIME_ENTRY',
  'EMPLOYEE',
  'ESTIMATE_ITEM',
  'CONTACT',
] as const;

// Define vendor types
export const vendorTypes = ['vendor', 'subcontractor', 'other'] as const;

// Define expense types from central constants but as a readonly array
export const expenseTypes = [
  'material',
  'equipment',
  'tools',
  'supplies',
  'labor',
  'subcontractor',
  'permit',
  'travel',
  'office',
  'utility',
  'other',
] as const;

// For backward compatibility - alias expenseTypes as costTypes
export const costTypes = expenseTypes;

// Define which expense types are associated with vendors or subcontractors
// Using the relations from central constants
export const expenseTypeRelations = EXPENSE_TYPE_RELATIONS;

// Helper function to determine if expense type requires/allows a vendor
export const expenseTypeRequiresVendor = requiresVendor;
export const expenseTypeAllowsSubcontractor = allowsSubcontractor;

// Entity-specific category mapping
export const entityCategoryMap: Record<string, string[]> = {
  PROJECT: [
    'contract',
    'photo',
    'certification',
    'receipt',
    'invoice',
    'drawing',
    'specification',
    'permit_document',
    'other',
  ],
  CUSTOMER: ['contract', 'invoice', 'other', 'correspondence'],
  ESTIMATE: ['3rd_party_estimate', 'contract', 'drawing', 'specification', 'other'],
  WORK_ORDER: ['receipt', 'photo', 'invoice', 'report', 'other'],
  VENDOR: ['invoice', 'certification', 'contract', 'receipt', 'other'],
  SUBCONTRACTOR: ['certification', 'insurance', 'contract', 'invoice', 'other'],
  CONTACT: ['contract', 'certification', 'other', 'correspondence'],
  EXPENSE: ['receipt', 'invoice', 'other'],
  TIME_ENTRY: ['receipt', 'photo', 'other'],
  ESTIMATE_ITEM: ['receipt', 'invoice', '3rd_party_estimate', 'other'],
};

// Define the document metadata schema
export const documentMetadataSchema = z.object({
  category: z.enum(documentCategories),
  entityType: z.enum(entityTypes),
  entityId: z.string(), // Now required as per our database change
  amount: z.number().optional(),
  expenseDate: z.date().optional(),
  version: z.number().default(1),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  isExpense: z.boolean().default(false),
  vendorId: z.string().optional(),
  vendorType: z.enum(vendorTypes).optional(),
  expenseType: z.enum(expenseTypes).optional(),
  // Add parent entity fields for better tracking of relationships
  parentEntityType: z.enum(entityTypes).optional(),
  parentEntityId: z.string().optional(),
  budgetItemId: z.string().optional(),
});

// Define the form schema with validation for document upload
export const documentUploadSchema = z.object({
  files: z.array(z.instanceof(File)).min(1, 'At least one file is required'),
  metadata: documentMetadataSchema,
});

// Additional schema for internal document structure
export const documentSchema = z.object({
  document_id: z.string(),
  file_name: z.string(),
  file_type: z.string().nullable(),
  file_size: z.number().nullable(),
  storage_path: z.string(),
  entity_type: z.string(),
  entity_id: z.string(),
  uploaded_by: z.string().nullable(),
  tags: z.array(z.string()).nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  url: z.string().default(''),
  category: z.string().optional(),
  amount: z.number().optional(),
  expense_date: z.string().optional(),
  version: z.number().optional(),
  is_expense: z.boolean().optional(),
  notes: z.string().optional(),
  vendor_id: z.string().optional(),
  vendor_type: z.string().optional(),
  expense_type: z.string().optional(),
  materialName: z.string().optional(),
  costType: z.enum(expenseTypes).optional(),
  parent_document_id: z.string().nullable().optional(),

  // Add the new fields from our consolidated view
  item_id: z.string().nullable().optional(),
  item_description: z.string().optional(),
  item_reference: z.string().nullable().default(null),

  // Add fields for vendor and subcontractor document flags
  is_vendor_doc: z.boolean().optional(),
  is_subcontractor_doc: z.boolean().optional(),

  // Add revision ID for tracking which revision a document belongs to
  revision_id: z.string().optional(),

  // Add budget item ID for expense tracking
  budget_item_id: z.string().optional(),

  // Add parent entity fields for better navigation
  parent_entity_type: z.string().optional(),
  parent_entity_id: z.string().optional(),

  // Add the missing fields required for the type
  is_latest_version: z.boolean().default(true),
  mime_type: z.string().default('application/octet-stream'),
});

// Export types using our central constants
export type DocumentCategory = (typeof documentCategories)[number];
export type EntityType = (typeof entityTypes)[number];
export type VendorType = (typeof vendorTypes)[number];
export type ExpenseType = (typeof expenseTypes)[number];
export type DocumentMetadata = z.infer<typeof documentMetadataSchema>;
export type DocumentUploadFormValues = z.infer<typeof documentUploadSchema>;
export type Document = z.infer<typeof documentSchema>;

// Helper function to get available categories for a specific entity type
export const getEntityCategories = (entityType: string): DocumentCategory[] => {
  if (entityType in entityCategoryMap) {
    return entityCategoryMap[entityType] as DocumentCategory[];
  }
  return documentCategories as unknown as DocumentCategory[];
};

// Helper function to determine if a document is an expense based on category and entity type
export const isDocumentExpense = (category: string, entityType?: string): boolean => {
  if (category === 'receipt' || category === 'invoice') {
    return true;
  }

  if (entityType === 'EXPENSE') {
    return true;
  }

  return false;
};

// Helper function to get suggested tags based on entity type and category
export const getSuggestedTags = (entityType: string, category: string): string[] => {
  const tags: string[] = [];

  // Add category as tag
  tags.push(category);

  // Add entity type as tag
  tags.push(entityType.toLowerCase());

  // Add special tags based on combinations
  if (category === 'receipt' || category === 'invoice') {
    tags.push('expense');

    if (entityType === 'PROJECT') {
      tags.push('project_expense');
    } else if (entityType === 'WORK_ORDER') {
      tags.push('work_order_expense');
    }
  }

  if (category === 'insurance' && (entityType === 'VENDOR' || entityType === 'SUBCONTRACTOR')) {
    tags.push('compliance');
  }

  if (category === 'certification' && (entityType === 'VENDOR' || entityType === 'SUBCONTRACTOR')) {
    tags.push('compliance');
  }

  return tags;
};

// Helper to determine if a document is related to a budget item
export const isBudgetExpense = (document: Document): boolean => {
  return Boolean(document.budget_item_id);
};

// Helper to determine if expense is from a work order
export const isWorkOrderExpense = (document: Document): boolean => {
  return document.is_expense && document.entity_type === 'WORK_ORDER';
};

// Helper to determine if expense is from a project
export const isProjectExpense = (document: Document): boolean => {
  return document.is_expense && document.entity_type === 'PROJECT';
};
