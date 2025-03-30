
import { z } from 'zod';

// Define allowed entity types
export type EntityType = 'PROJECT' | 'CUSTOMER' | 'ESTIMATE' | 'WORK_ORDER' | 'VENDOR' | 'SUBCONTRACTOR';

// Extended entity types for internal use (not exposed in the public interface)
export type InternalEntityType = EntityType | 'EMPLOYEE' | 'TIME_ENTRY';

// Document categories
export type DocumentCategory = 
  | 'invoice' 
  | 'receipt' 
  | 'contract' 
  | 'permit' 
  | 'certificate' 
  | 'drawing' 
  | 'photo' 
  | 'other'
  | '3rd_party_estimate'
  | 'insurance'
  | 'certification';

export const documentCategories: DocumentCategory[] = [
  'invoice',
  'receipt',
  'contract',
  'permit', 
  'certificate',
  'drawing',
  'photo',
  'other',
  '3rd_party_estimate',
  'insurance',
  'certification'
];

// Entity types for selector
export const entityTypes: { value: EntityType; label: string }[] = [
  { value: 'PROJECT', label: 'Project' },
  { value: 'CUSTOMER', label: 'Customer' },
  { value: 'ESTIMATE', label: 'Estimate' },
  { value: 'WORK_ORDER', label: 'Work Order' },
  { value: 'VENDOR', label: 'Vendor' },
  { value: 'SUBCONTRACTOR', label: 'Subcontractor' }
];

// Vendor types
export type VendorType = 'vendor' | 'subcontractor' | 'other';

export const vendorTypes: { value: VendorType; label: string }[] = [
  { value: 'vendor', label: 'Material Vendor' },
  { value: 'subcontractor', label: 'Subcontractor' },
  { value: 'other', label: 'Other' }
];

// Expense types
export type ExpenseType = 
  | 'material' 
  | 'labor' 
  | 'equipment' 
  | 'permit' 
  | 'travel' 
  | 'food' 
  | 'other';

export const expenseTypes: { value: ExpenseType; label: string }[] = [
  { value: 'material', label: 'Material' },
  { value: 'labor', label: 'Labor' },
  { value: 'equipment', label: 'Equipment Rental' },
  { value: 'permit', label: 'Permit/License Fee' },
  { value: 'travel', label: 'Travel' },
  { value: 'food', label: 'Food/Meal' },
  { value: 'other', label: 'Other' }
];

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
  parent_document_id?: string;
  is_receipt?: boolean;
}

// Type for document viewer
export interface DocumentViewData {
  document_id: string;
  file_name: string;
  file_type: string;
  url: string;
}

// Document preview card props
export interface DocumentPreviewCardProps {
  document: Document;
  onView: () => void;
  onDelete?: () => void;
  showEntityInfo?: boolean;
}

// Document viewer props
export interface DocumentViewerProps {
  document: DocumentViewData | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
}
