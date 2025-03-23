
import * as z from 'zod';

// Define the form schema with validation
export const estimateFormSchema = z.object({
  project: z.string().min(1, { message: "Project name is required" }),
  customer: z.string().min(1, { message: "Customer is required" }).optional().or(z.literal('')),
  description: z.string().optional(),
  location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
  }),
  contingency_percentage: z.string().optional().default("0"),
  items: z.array(z.object({
    description: z.string().min(1, { message: "Description is required" }),
    item_type: z.enum(['labor', 'vendor', 'subcontractor']).default('labor'),
    cost: z.string().min(1, { message: "Cost is required" }),
    markup_percentage: z.string().default("0"),
    quantity: z.string().optional().default("1"),
    unitPrice: z.string().optional(),
    vendor_id: z.string().optional(),
    subcontractor_id: z.string().optional(),
  })).min(1, { message: "At least one item is required" }),
  showSiteLocation: z.boolean().default(false),
  newCustomer: z.object({
    name: z.string().optional(),
    email: z.string().email("Invalid email address").optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
  }).optional(),
  isNewCustomer: z.boolean().default(false),
});

export type EstimateFormValues = z.infer<typeof estimateFormSchema>;

// Define a type for calculation functions to ensure consistency
export type EstimateItem = {
  item_type?: string;
  cost: string;
  markup_percentage: string;
  quantity?: string;
  unitPrice?: string;
};

// Types for calculation results
export type ItemCalculationResult = {
  cost: number;
  price: number;
  markup: number;
  grossMargin: number;
  grossMarginPercentage: number;
};
