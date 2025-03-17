
import * as z from 'zod';

// Define the form schema with validation
export const estimateFormSchema = z.object({
  project: z.string().min(1, { message: "Project name is required" }),
  client: z.string().min(1, { message: "Client is required" }),
  description: z.string().optional(),
  location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
  }),
  contingency_percentage: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1, { message: "Description is required" }),
    quantity: z.string().min(1, { message: "Quantity is required" }),
    unitPrice: z.string().min(1, { message: "Unit price is required" }),
  })).min(1, { message: "At least one item is required" }),
});

export type EstimateFormValues = z.infer<typeof estimateFormSchema>;
