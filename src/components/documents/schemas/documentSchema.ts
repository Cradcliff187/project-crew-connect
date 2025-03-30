
import { z } from 'zod';

// Define allowed entity types
export type EntityType = 'PROJECT' | 'CUSTOMER' | 'ESTIMATE' | 'WORK_ORDER' | 'VENDOR' | 'SUBCONTRACTOR';

// Document metadata schema
export const documentMetadataSchema = z.object({
  entityType: z.enum(['PROJECT', 'CUSTOMER', 'ESTIMATE', 'WORK_ORDER', 'VENDOR', 'SUBCONTRACTOR']),
  entityId: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  version: z.number().optional(),
  isExpense: z.boolean().optional(),
  vendorId: z.string().optional(),
  vendorType: z.enum(['vendor', 'subcontractor', 'other']).optional(),
  expenseType: z.string().optional(),
  amount: z.number().optional(),
  expenseDate: z.date().optional(),
  notes: z.string().optional(),
});

// Document upload form values schema
export const documentUploadSchema = z.object({
  files: z.array(z.instanceof(File)),
  metadata: documentMetadataSchema,
});

export type DocumentMetadata = z.infer<typeof documentMetadataSchema>;
export type DocumentUploadFormValues = z.infer<typeof documentUploadSchema>;

// Document interface for fetched documents
export interface Document {
  document_id: string;
  file_name: string;
  file_type?: string;
  file_size?: number;
  storage_path: string;
  entity_type: string;
  entity_id: string;
  uploaded_by?: string;
  created_at: string;
  updated_at?: string;
  tags?: string[];
  category?: string;
  version?: number;
  is_expense?: boolean;
  vendor_id?: string;
  vendor_type?: string;
  expense_type?: string;
  amount?: number;
  expense_date?: string;
  notes?: string;
  url?: string;
}
