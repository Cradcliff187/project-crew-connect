import * as z from 'zod';

export const workOrderFormSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  work_order_number: z.string().optional(),
  description: z.string().optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  po_number: z.string().optional(),

  // Schedule Fields
  scheduled_date: z.date().optional(),
  due_by_date: z.date().optional(),
  time_estimate: z.number().positive().optional(),

  // Calendar Integration
  calendar_sync_enabled: z.boolean().default(false),
  calendar_event_id: z.string().optional(),

  // Location Fields
  customer_id: z.string().optional(),
  location_id: z.string().optional(),

  // Custom location fields (when not using existing location)
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),

  // Assignment
  assigned_to: z.string().optional(),

  // For form purposes
  useCustomAddress: z.boolean().default(false),
});

export type WorkOrderFormValues = z.infer<typeof workOrderFormSchema>;

export default workOrderFormSchema;
