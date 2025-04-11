
import { z } from "zod";

// Update the EntityType enum to match project requirements
export enum EntityType {
  PROJECT = "PROJECT",
  ESTIMATE = "ESTIMATE",
  ESTIMATE_ITEM = "ESTIMATE_ITEM",
  WORK_ORDER = "WORK_ORDER",
  SUBCONTRACTOR = "SUBCONTRACTOR",
  VENDOR = "VENDOR",
  CUSTOMER = "CUSTOMER",
  CONTACT = "CONTACT",
  EMPLOYEE = "EMPLOYEE",
  SITE_LOCATION = "SITE_LOCATION",
  CHANGE_ORDER = "CHANGE_ORDER",
  MATERIAL = "MATERIAL",
  EQUIPMENT = "EQUIPMENT",
  TIME_ENTRY = "TIME_ENTRY",
  RECEIPT = "RECEIPT"
}

// Document category types
export enum DocumentCategory {
  GENERAL = "general",
  RECEIPT = "receipt",
  INVOICE = "invoice",
  CONTRACT = "contract",
  SPECIFICATION = "specification",
  PHOTO = "photo",
  PERMIT = "permit",
  CERTIFICATE = "certificate",
  INSURANCE = "insurance",
  WARRANTY = "warranty",
  CHANGE_ORDER = "change_order",
  ESTIMATE = "estimate",
  THIRD_PARTY_ESTIMATE = "3rd_party_estimate",
  PROPOSAL = "proposal",
  AGREEMENT = "agreement",
  CERTIFICATION = "certification",
  OTHER = "other"
}

// Map entity types to their relevant document categories
export const entityCategoryMap: Record<EntityType, DocumentCategory[]> = {
  [EntityType.PROJECT]: [
    DocumentCategory.GENERAL,
    DocumentCategory.CONTRACT,
    DocumentCategory.SPECIFICATION,
    DocumentCategory.PHOTO,
    DocumentCategory.PERMIT,
    DocumentCategory.CERTIFICATE,
    DocumentCategory.INSURANCE,
    DocumentCategory.WARRANTY,
    DocumentCategory.CHANGE_ORDER,
    DocumentCategory.OTHER
  ],
  [EntityType.ESTIMATE]: [
    DocumentCategory.GENERAL,
    DocumentCategory.ESTIMATE,
    DocumentCategory.PROPOSAL,
    DocumentCategory.THIRD_PARTY_ESTIMATE,
    DocumentCategory.AGREEMENT,
    DocumentCategory.OTHER
  ],
  [EntityType.ESTIMATE_ITEM]: [
    DocumentCategory.GENERAL,
    DocumentCategory.SPECIFICATION,
    DocumentCategory.PHOTO,
    DocumentCategory.OTHER
  ],
  [EntityType.WORK_ORDER]: [
    DocumentCategory.GENERAL,
    DocumentCategory.RECEIPT,
    DocumentCategory.INVOICE,
    DocumentCategory.PHOTO,
    DocumentCategory.OTHER
  ],
  [EntityType.SUBCONTRACTOR]: [
    DocumentCategory.GENERAL,
    DocumentCategory.CONTRACT,
    DocumentCategory.INSURANCE,
    DocumentCategory.CERTIFICATION,
    DocumentCategory.OTHER
  ],
  [EntityType.VENDOR]: [
    DocumentCategory.GENERAL,
    DocumentCategory.INVOICE,
    DocumentCategory.RECEIPT,
    DocumentCategory.OTHER
  ],
  [EntityType.CUSTOMER]: [
    DocumentCategory.GENERAL,
    DocumentCategory.CONTRACT,
    DocumentCategory.AGREEMENT,
    DocumentCategory.OTHER
  ],
  [EntityType.CONTACT]: [
    DocumentCategory.GENERAL,
    DocumentCategory.CONTRACT,
    DocumentCategory.OTHER
  ],
  [EntityType.EMPLOYEE]: [
    DocumentCategory.GENERAL,
    DocumentCategory.CERTIFICATION,
    DocumentCategory.OTHER
  ],
  [EntityType.SITE_LOCATION]: [
    DocumentCategory.GENERAL,
    DocumentCategory.PHOTO,
    DocumentCategory.PERMIT,
    DocumentCategory.OTHER
  ],
  [EntityType.CHANGE_ORDER]: [
    DocumentCategory.GENERAL,
    DocumentCategory.CHANGE_ORDER,
    DocumentCategory.OTHER
  ],
  [EntityType.MATERIAL]: [
    DocumentCategory.GENERAL,
    DocumentCategory.RECEIPT,
    DocumentCategory.INVOICE,
    DocumentCategory.SPECIFICATION,
    DocumentCategory.OTHER
  ],
  [EntityType.EQUIPMENT]: [
    DocumentCategory.GENERAL,
    DocumentCategory.RECEIPT,
    DocumentCategory.INVOICE,
    DocumentCategory.WARRANTY,
    DocumentCategory.OTHER
  ],
  [EntityType.TIME_ENTRY]: [
    DocumentCategory.GENERAL,
    DocumentCategory.RECEIPT,
    DocumentCategory.OTHER
  ],
  [EntityType.RECEIPT]: [
    DocumentCategory.RECEIPT,
    DocumentCategory.INVOICE,
    DocumentCategory.OTHER
  ]
};

// Get available categories for a given entity type
export function getEntityCategories(entityType: EntityType): DocumentCategory[] {
  return entityCategoryMap[entityType] || [DocumentCategory.GENERAL, DocumentCategory.OTHER];
}

// Document interface that matches database schema
export interface Document {
  document_id: string;
  file_name: string;
  file_type?: string;
  file_size?: number;
  storage_path: string;
  url?: string;
  entity_id: string;
  entity_type: EntityType;
  created_at: string;
  updated_at?: string;
  category?: string;
  is_expense?: boolean;
  tags?: string[];
  notes?: string;
  amount?: number;
  expense_date?: string;
  uploaded_by?: string;
  vendor_id?: string;
  vendor_type?: string;
  expense_type?: string;
  version?: number;
  is_latest_version?: boolean;
  parent_document_id?: string;
}

// All document categories in a flat array
export const documentCategories: DocumentCategory[] = Object.values(DocumentCategory);

// Document relationship types
export enum RelationshipType {
  RELATED = "RELATED",
  VERSION_OF = "VERSION_OF",
  ATTACHMENT_TO = "ATTACHMENT_TO",
  RECEIPT_FOR = "RECEIPT_FOR",
  INVOICE_FOR = "INVOICE_FOR"
}

// Document relationship interface
export interface DocumentRelationship {
  id: string;
  source_document_id: string;
  target_document_id: string;
  relationship_type: RelationshipType;
  created_at: string;
  source_document?: Document;
  target_document?: Document;
}

export interface DocumentWithRelation extends Document {
  relationships?: DocumentRelationship[];
}

// Parameters for creating a relationship between documents
export interface CreateRelationshipParams {
  sourceDocumentId: string;
  targetDocumentId: string;
  relationshipType: RelationshipType;
}

// Result of document upload operation
export interface DocumentUploadResult {
  success: boolean;
  documentId?: string;
  document?: Document;
  error?: any;
  message?: string;
}

// Form values schema for document upload
export const DocumentUploadSchema = z.object({
  files: z.array(z.instanceof(File)).min(1, "At least one file is required"),
  metadata: z.object({
    entityType: z.nativeEnum(EntityType).optional(),
    entityId: z.string().optional(),
    category: z.string().optional(),
    isExpense: z.boolean().optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
    amount: z.number().nullish(),
    expenseDate: z.union([z.string(), z.date()]).optional(),
    vendorId: z.string().optional().nullable(),
    vendorType: z.string().optional().nullable(),
    expenseType: z.string().optional().nullable(),
    budgetItemId: z.string().optional().nullable(),
    version: z.number().optional(),
    parentEntityType: z.nativeEnum(EntityType).optional(),
    parentEntityId: z.string().optional()
  }).optional()
});

// Document upload form values type
export type DocumentUploadFormValues = z.infer<typeof DocumentUploadSchema>;
