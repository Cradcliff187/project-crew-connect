
import { z } from 'zod';

// Define the EntityType enum that will be used application-wide
export enum EntityType {
  PROJECT = 'PROJECT',
  WORK_ORDER = 'WORK_ORDER',
  ESTIMATE = 'ESTIMATE',
  CUSTOMER = 'CUSTOMER',
  VENDOR = 'VENDOR',
  CONTACT = 'CONTACT',
  SUBCONTRACTOR = 'SUBCONTRACTOR',
  EXPENSE = 'EXPENSE',
  TIME_ENTRY = 'TIME_ENTRY',
  EMPLOYEE = 'EMPLOYEE',
  ESTIMATE_ITEM = 'ESTIMATE_ITEM',
  BUDGET_ITEM = 'BUDGET_ITEM',
  CHANGE_ORDER = 'CHANGE_ORDER'
}

// Define document categories
export enum DocumentCategory {
  RECEIPT = 'receipt',
  INVOICE = 'invoice',
  CONTRACT = 'contract',
  PHOTO = 'photo',
  GENERAL = 'general',
  SPECIFICATIONS = 'specifications',
  PERMIT = 'permit',
  CERTIFICATE = 'certificate',
  OTHER = 'other',
  THIRD_PARTY_ESTIMATE = '3rd_party_estimate',
  INSURANCE = 'insurance',
  CERTIFICATION = 'certification'
}

// Export an array of document categories for dropdowns
export const documentCategories = Object.values(DocumentCategory);

// Define expense types
export enum ExpenseType {
  MATERIAL = 'material',
  LABOR = 'labor',
  EQUIPMENT = 'equipment',
  SUBCONTRACTOR = 'subcontractor',
  PERMIT = 'permit',
  GENERAL = 'general',
  OTHER = 'other'
}

// Export an array of expense types for dropdowns
export const expenseTypes = Object.values(ExpenseType);

// Define vendor types
export enum VendorType {
  SUPPLIER = 'supplier',
  MANUFACTURER = 'manufacturer',
  DISTRIBUTOR = 'distributor',
  OTHER = 'other'
}

// Export an array of vendor types for dropdowns
export const vendorTypes = Object.values(VendorType);

// Define entity types array for dropdowns
export const entityTypes = Object.values(EntityType);

// Entity category mapping
export const entityCategoryMap: Record<EntityType, DocumentCategory[]> = {
  [EntityType.PROJECT]: [
    DocumentCategory.CONTRACT, 
    DocumentCategory.PHOTO, 
    DocumentCategory.SPECIFICATIONS,
    DocumentCategory.PERMIT,
    DocumentCategory.GENERAL
  ],
  [EntityType.WORK_ORDER]: [
    DocumentCategory.PHOTO,
    DocumentCategory.RECEIPT,
    DocumentCategory.INVOICE,
    DocumentCategory.GENERAL
  ],
  [EntityType.ESTIMATE]: [
    DocumentCategory.CONTRACT,
    DocumentCategory.SPECIFICATIONS,
    DocumentCategory.GENERAL
  ],
  [EntityType.CUSTOMER]: [
    DocumentCategory.CONTRACT,
    DocumentCategory.INVOICE,
    DocumentCategory.GENERAL
  ],
  [EntityType.VENDOR]: [
    DocumentCategory.INVOICE,
    DocumentCategory.RECEIPT,
    DocumentCategory.CONTRACT,
    DocumentCategory.GENERAL
  ],
  [EntityType.CONTACT]: [
    DocumentCategory.CONTRACT,
    DocumentCategory.GENERAL
  ],
  [EntityType.SUBCONTRACTOR]: [
    DocumentCategory.CONTRACT,
    DocumentCategory.INVOICE,
    DocumentCategory.CERTIFICATE,
    DocumentCategory.PERMIT,
    DocumentCategory.GENERAL
  ],
  [EntityType.EXPENSE]: [
    DocumentCategory.RECEIPT,
    DocumentCategory.INVOICE,
    DocumentCategory.GENERAL
  ],
  [EntityType.TIME_ENTRY]: [
    DocumentCategory.PHOTO,
    DocumentCategory.RECEIPT,
    DocumentCategory.GENERAL
  ],
  [EntityType.EMPLOYEE]: [
    DocumentCategory.CONTRACT,
    DocumentCategory.CERTIFICATE,
    DocumentCategory.GENERAL
  ],
  [EntityType.ESTIMATE_ITEM]: [
    DocumentCategory.SPECIFICATIONS,
    DocumentCategory.PHOTO,
    DocumentCategory.GENERAL
  ],
  [EntityType.BUDGET_ITEM]: [
    DocumentCategory.RECEIPT,
    DocumentCategory.INVOICE,
    DocumentCategory.GENERAL
  ],
  [EntityType.CHANGE_ORDER]: [
    DocumentCategory.CONTRACT,
    DocumentCategory.SPECIFICATIONS,
    DocumentCategory.GENERAL
  ]
};

// Helper function to get relevant categories for an entity type
export function getEntityCategories(entityType: EntityType): DocumentCategory[] {
  return entityCategoryMap[entityType] || Object.values(DocumentCategory);
}

// Define relationship types
export enum RelationshipType {
  PARENT_CHILD = 'PARENT_CHILD',
  VERSION = 'VERSION',
  REFERENCE = 'REFERENCE',
  RELATED = 'RELATED'
}

// Document interface
export interface Document {
  document_id: string;
  file_name: string;
  file_type?: string;
  file_size?: number;
  storage_path: string;
  entity_type: EntityType;
  entity_id: string;
  category?: DocumentCategory | string;
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at?: string;
  url?: string;
  amount?: number | null;
  expense_date?: string | null;
  is_expense?: boolean;
  version?: number;
  parent_document_id?: string | null;
  is_latest_version?: boolean;
  uploaded_by?: string;
  vendor_id?: string;
  vendor_type?: string;
  expense_type?: string;
  budget_item_id?: string;
  parent_entity_type?: EntityType;
  parent_entity_id?: string;
  mime_type?: string;
  // Add item reference fields for estimate items
  item_id?: string;
  item_reference?: string;
}

// Document relationship interface
export interface DocumentRelationship {
  id: string;
  source_document_id: string;
  target_document_id: string;
  relationship_type: RelationshipType;
  relationship_metadata?: Record<string, any>;
  created_at: string;
}

// Export a type for document with relationships
export interface DocumentWithRelation extends Document {
  relationships?: DocumentRelationship[];
}

// Export params type for creating relationships
export interface CreateRelationshipParams {
  sourceDocumentId: string;
  targetDocumentId: string;
  relationshipType: RelationshipType;
  metadata?: Record<string, any>;
}

// Document upload metadata schema
export interface DocumentUploadMetadata {
  entityType: EntityType;
  entityId: string;
  category?: DocumentCategory | string;
  isExpense?: boolean;
  amount?: number | null;
  expenseDate?: string | Date | null;
  vendorId?: string | null;
  vendorType?: string | null;
  expenseType?: string | null;
  budgetItemId?: string | null;
  parentEntityType?: EntityType;
  parentEntityId?: string;
  tags?: string[];
  notes?: string;
  version?: number;
}

// Document file validation schema
export const DocumentFileSchema = z.instanceof(File).refine(
  file => file.size <= 15 * 1024 * 1024, // 15 MB max size
  {
    message: 'File is too large. Maximum size is 15MB.',
  }
);

// Document metadata schema
export const DocumentMetadataSchema = z.object({
  entityType: z.nativeEnum(EntityType),
  entityId: z.string(),
  category: z.string().optional(),
  isExpense: z.boolean().optional(),
  amount: z.number().nullable().optional(),
  expenseDate: z.union([z.date(), z.string()]).optional().nullable(),
  vendorId: z.string().optional().nullable(),
  vendorType: z.string().optional().nullable(),
  expenseType: z.string().optional().nullable(),
  budgetItemId: z.string().optional().nullable(),
  parentEntityType: z.nativeEnum(EntityType).optional(),
  parentEntityId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  version: z.number().optional()
});

// Main document upload form schema
export const DocumentUploadSchema = z.object({
  files: z.array(DocumentFileSchema).min(1, "At least one file is required"),
  metadata: DocumentMetadataSchema,
});

// Export with correct TypeScript syntax for types
export type DocumentUploadFormValues = z.infer<typeof DocumentUploadSchema>;
export type DocumentMetadata = z.infer<typeof DocumentMetadataSchema>;

// Re-export types correctly 
export type { Document, DocumentWithRelation, DocumentRelationship, CreateRelationshipParams };
