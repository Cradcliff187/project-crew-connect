
import * as z from 'zod';

// Define the category options
export const documentCategories = [
  'invoice',
  'receipt',
  'estimate',
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
  'EXPENSE'
] as const;

// Define the document metadata schema
export const documentMetadataSchema = z.object({
  category: z.enum(documentCategories),
  entityType: z.enum(entityTypes),
  entityId: z.string().optional(),
  amount: z.number().optional(),
  expenseDate: z.date().optional(),
  version: z.number().default(1),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  isExpense: z.boolean().default(false),
  // Replace vendorId and vendorType with separate fields for vendors and subcontractors
  vendorId: z.string().optional(),
  subcontractorId: z.string().optional(),
});

// Define the form schema with validation for document upload
export const documentUploadSchema = z.object({
  files: z.array(z.instanceof(File)).min(1, "At least one file is required"),
  metadata: documentMetadataSchema
});

export type DocumentCategory = typeof documentCategories[number];
export type EntityType = typeof entityTypes[number];
export type DocumentMetadata = z.infer<typeof documentMetadataSchema>;
export type DocumentUploadFormValues = z.infer<typeof documentUploadSchema>;

// Define document model for frontend use
export interface Document {
  document_id: string;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  storage_path: string;
  entity_type: string;
  entity_id: string;
  uploaded_by: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  url?: string;
  category?: string;
  amount?: number;
  expense_date?: string;
  version?: number;
  is_expense?: boolean;
  notes?: string;
  // Replace vendor_id and vendor_type with separate fields
  vendor_id?: string;
  subcontractor_id?: string;
}

// Data that can be prefilled when uploading a document
export interface PrefillData {
  amount?: number;
  vendorId?: string;
  subcontractorId?: string;
  materialName?: string;
}
