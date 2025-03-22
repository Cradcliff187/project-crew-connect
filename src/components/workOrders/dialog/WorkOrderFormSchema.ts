
import { z } from 'zod';

const workOrderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  work_order_number: z.string().optional(),
  description: z.string().optional(),
  priority: z.string().default('MEDIUM'),
  po_number: z.string().optional(),
  time_estimate: z.number().min(0).optional(),
  scheduled_date: z.date().optional(),
  due_by_date: z.date().optional(),
  customer_id: z.string().optional(),
  location_id: z.string().optional(),
  use_custom_address: z.boolean().default(false),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  assigned_to: z.string().optional(),
});

export type WorkOrderFormValues = z.infer<typeof workOrderSchema>;

export default workOrderSchema;
