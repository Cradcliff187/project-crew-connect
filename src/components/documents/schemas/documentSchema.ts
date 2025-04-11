
import { z } from 'zod';
import { EntityType } from '@/services/documentService';

// Document file validation schema
export const DocumentFileSchema = z.instanceof(File).refine(
  file => file.size <= 15 * 1024 * 1024, // 15 MB max size
  {
    message: 'File is too large. Maximum size is 15MB.',
  }
);

// Document metadata schema
export const DocumentMetadataSchema = z.object({
  entityType: z.custom<EntityType>(),
  entityId: z.string(),
  category: z.string().optional(),
  isExpense: z.boolean().optional(),
  amount: z.number().nullable().optional(),
  expenseDate: z.union([z.date(), z.string()]).optional().nullable(),
  vendorId: z.string().optional().nullable(),
  vendorType: z.string().optional().nullable(),
  expenseType: z.string().optional().nullable(),
  budgetItemId: z.string().optional().nullable(),
  parentEntityType: z.custom<EntityType>().optional(),
  parentEntityId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// Main document upload form schema
export const DocumentUploadSchema = z.object({
  files: z.array(DocumentFileSchema).min(1, "At least one file is required"),
  metadata: DocumentMetadataSchema,
});

// Types derived from the schemas
export type DocumentUploadFormValues = z.infer<typeof DocumentUploadSchema>;
export type DocumentMetadata = z.infer<typeof DocumentMetadataSchema>;

export { EntityType };
