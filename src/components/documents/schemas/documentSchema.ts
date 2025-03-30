
import { z } from "zod";

// Define the valid entity types
export const entityTypes = [
  'PROJECT', 
  'CUSTOMER', 
  'WORK_ORDER', 
  'VENDOR', 
  'SUBCONTRACTOR',
  'ESTIMATE',
  'TIME_ENTRY',
  'EMPLOYEE',
  'DETACHED',
  'EXPENSE'  // Adding EXPENSE to fix type errors
] as const;

// Internal types that aren't exposed to the user interface
export const internalEntityTypes = [
  ...entityTypes
] as const;

// Define expense types
export const expenseTypes = [
  'material',  // Note: 'materials' should be 'material' to match the type
  'labor',
  'equipment',
  'service',
  'travel',
  'other'
] as const;

// Define vendor types for selection
export const vendorTypes = [
  'vendor',
  'subcontractor',
  'other'
] as const;

// Define document categories
export const documentCategories = [
  'invoice',
  'receipt',
  'contract',
  'certificate',
  'permit',
  'proposal',
  'specification',
  'drawing',
  'photo',
  'estimate',                // Adding missing category
  '3rd_party_estimate',      // Adding missing category
  'insurance',               // Adding missing category
  'certification',           // Adding missing category
  'other'
] as const;

// Zod schemas
export const documentMetadataSchema = z.object({
  entityType: z.enum(entityTypes).optional(),
  entityId: z.string().optional(),
  isExpense: z.boolean().optional().default(false),
  expenseType: z.enum(expenseTypes).optional(),
  amount: z.number().optional(),
  expenseDate: z.date().optional(),
  vendorId: z.string().optional(),
  vendorType: z.enum(vendorTypes).optional(),
  category: z.enum(documentCategories).optional(),
  tags: z.array(z.string()).optional().default([]),
  notes: z.string().optional(),
  version: z.number().optional().default(1),
});

export const documentUploadSchema = z.object({
  files: z.array(z.instanceof(File)).min(1, "At least one file is required"),
  metadata: documentMetadataSchema,
});

// TypeScript types derived from schemas
export type EntityType = typeof entityTypes[number];
export type InternalEntityType = typeof internalEntityTypes[number];
export type ExpenseType = typeof expenseTypes[number];
export type DocumentCategory = typeof documentCategories[number];
export type VendorType = typeof vendorTypes[number];

export type DocumentMetadata = z.infer<typeof documentMetadataSchema>;
export type DocumentUploadFormValues = z.infer<typeof documentUploadSchema>;

// Interface for document objects returned from the database
export interface Document {
  document_id: string;
  file_name: string;
  file_type?: string;
  file_size?: number;
  storage_path: string;
  entity_type: EntityType;
  entity_id: string;
  category?: DocumentCategory;
  is_expense?: boolean;
  expense_type?: ExpenseType;
  amount?: number;
  expense_date?: string;
  vendor_id?: string;
  vendor_type?: VendorType;
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  uploaded_by?: string;
  is_latest_version?: boolean;
  parent_document_id?: string;
  version?: number;
  url?: string;  // Adding this property to fix the 'url' not found errors
}

// Interface for document viewer props
export interface DocumentViewerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
  isLoading?: boolean;
}

// Interface for document view data (used in hooks)
export interface DocumentViewData {
  document_id: string;
  file_name: string;
  file_type: string;
  url: string;
}
