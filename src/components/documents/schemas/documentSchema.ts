
import * as z from 'zod';

// Define the category options
export const documentCategories = [
  'invoice',
  'receipt',
  '3rd_party_estimate',
  'contract',
  'insurance',
  'certification',
  'photo',
  'other'
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
  'ESTIMATE_ITEM' // Added for line item documents
] as const;

// Define vendor types
export const vendorTypes = [
  'vendor',
  'subcontractor',
  'other'
] as const;

// Define expense types for receipts
export const expenseTypes = [
  'materials',
  'equipment',
  'supplies',
  'other'
] as const;

// For backward compatibility - alias expenseTypes as costTypes
export const costTypes = expenseTypes;

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
});

// Define the form schema with validation for document upload
export const documentUploadSchema = z.object({
  files: z.array(z.instanceof(File)).min(1, "At least one file is required"),
  metadata: documentMetadataSchema
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
  url: z.string().optional(),
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
  item_id: z.string().optional(),
  item_description: z.string().optional(),
  item_reference: z.string().optional(),
  
  // Add fields for vendor and subcontractor document flags
  is_vendor_doc: z.boolean().optional(),
  is_subcontractor_doc: z.boolean().optional(),
  
  // Add revision ID for tracking which revision a document belongs to
  revision_id: z.string().optional(),
  
  // Add the missing fields required for the type
  is_latest_version: z.boolean().optional(),
  mime_type: z.string().optional()
});

export type DocumentCategory = typeof documentCategories[number];
export type EntityType = typeof entityTypes[number];
export type VendorType = typeof vendorTypes[number];
export type ExpenseType = typeof expenseTypes[number];
export type DocumentMetadata = z.infer<typeof documentMetadataSchema>;
export type DocumentUploadFormValues = z.infer<typeof documentUploadSchema>;
export type Document = z.infer<typeof documentSchema>;
