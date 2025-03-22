import { z } from 'zod';

// Add the missing costTypes export for CostTypeSelector component
export const expenseTypes = ['materials', 'equipment', 'supplies', 'other'];
export const costTypes = expenseTypes; // Alias for backward compatibility

export const documentSchema = z.object({
  documentId: z.string().optional(),
  entityType: z.string(),
  entityId: z.string(),
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  storagePath: z.string(),
  uploadDate: z.string(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  createdBy: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  isReceipt: z.boolean().optional(),
  amount: z.number().optional(),
  vendorId: z.string().optional(),
  costType: z.enum(['materials', 'equipment', 'supplies', 'other']).optional(),
  materialName: z.string().optional(),
});

export type Document = z.infer<typeof documentSchema>;
