import * as z from 'zod';

// Define the form schema with validation
export const projectFormSchema = z
  .object({
    projectName: z.string().min(1, { message: 'Project name is required' }),
    customerId: z.string().optional(),
    jobDescription: z.string().optional(),
    status: z.string().default('active'),
    estimateId: z.string().optional(),
    siteLocationSameAsCustomer: z.boolean().default(true),
    dueDate: z.string().optional(),
    siteLocation: z.object({
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
    }),
    newCustomer: z.object({
      customerName: z.string().optional(),
      email: z.string().email().optional().or(z.literal('')),
      phone: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
    }),
  })
  .refine(
    data => {
      // Either customerId is provided OR customerName is provided
      return !!data.customerId || !!data.newCustomer.customerName;
    },
    {
      message: 'Either select an existing customer or provide a name for a new customer',
      path: ['customerId'],
    }
  );

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
