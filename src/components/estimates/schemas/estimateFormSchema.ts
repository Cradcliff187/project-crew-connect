import { z } from 'zod';

export const estimateFormSchema = z.object({
  project: z.string().min(1, { message: 'Project name is required' }),
  customer: z.string().optional(),
  description: z.string().optional(),
  contingency_percentage: z.string().default('0'),
  location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
  }),
  items: z
    .array(
      z.object({
        temp_item_id: z.string().optional(),
        description: z.string().min(1, { message: 'Description is required' }),
        quantity: z.string().default('1'),
        unit_price: z.string().default('0'),
        cost: z.string().default('0'),
        markup_percentage: z.string().default('0'),
        item_type: z.string().optional(),
        vendor_id: z.string().optional(),
        subcontractor_id: z.string().optional(),
        document_id: z.string().optional(),
        trade_type: z.string().optional(),
        expense_type: z.string().optional(),
        custom_type: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .default([]), // Set default to empty array to ensure it's always defined
  showSiteLocation: z.boolean().default(false),
  isNewCustomer: z.boolean().default(false),
  newCustomer: z.object({
    name: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
  }),
  estimate_documents: z.array(z.string()).optional(),
  // Add temporary ID for document handling
  temp_id: z.string().optional(),
});

export type EstimateFormValues = z.infer<typeof estimateFormSchema>;

// Export the EstimateItem type for calculations - ensure all required properties have defaults
export type EstimateItem = {
  cost: string;
  markup_percentage: string;
  quantity: string;
  unit_price: string; // Make this required to match our calculations
  item_type?: string;
  trade_type?: string;
  expense_type?: string;
  custom_type?: string;
  vendor_id?: string;
  subcontractor_id?: string;
  document_id?: string;
  description?: string;
  notes?: string;
  temp_item_id?: string; // Added temporary item ID
};
