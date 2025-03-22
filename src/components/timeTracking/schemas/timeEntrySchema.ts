
import { z } from 'zod';
import { calculateHoursWorked } from '../utils/timeCalculations';

export const timeEntrySchema = z.object({
  entityType: z.enum(['work_order', 'project']),
  entityId: z.string().min(1, "Please select a work order or project"),
  employeeId: z.string().min(1, "Please select an employee"),
  workDate: z.date(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Please enter a valid time in 24-hour format (HH:MM)"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Please enter a valid time in 24-hour format (HH:MM)"),
  hoursWorked: z.number().min(0.01, "Hours worked must be greater than 0"),
  notes: z.string().optional(),
}).refine((data) => {
  const hoursWorked = calculateHoursWorked(data.startTime, data.endTime);
  return hoursWorked > 0;
}, {
  message: "End time must be after start time",
  path: ['endTime']
});

export type TimeEntryFormValues = z.infer<typeof timeEntrySchema>;
